import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateStudentDto } from '../dto/create-student.dto';
import { CreateInstructorDto } from '../dto/create-instructor.dto';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../../../shared/services/token.service';
import { EmailService } from '../../../shared/services/email.service';
import { VerificationTokenService } from '../../../shared/services/verification-token.service';
import { IJwtData } from '../../../shared/interfaces/jwt.interface';
import { Op, CreationAttributes } from 'sequelize';
import { UniqueConstraintError } from 'sequelize';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private tokenService: TokenService,
    private emailService: EmailService,
    private verificationTokenService: VerificationTokenService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const transaction = await this.userModel.sequelize!.transaction();
    let user: User;

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const verificationToken = this.verificationTokenService.generateToken();
      const verificationExpires =
        this.verificationTokenService.getExpirationDate();

      user = await this.userModel.create(
        {
          ...createUserDto,
          password: hashedPassword,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        } as CreationAttributes<User>,
        { transaction },
      );

      // Send verification email
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
      );

      // Generate tokens for the new user
      const jwtData: IJwtData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const [accessToken, refreshToken] =
        await this.tokenService.getTokens(jwtData);

      // Commit the transaction
      await transaction.commit();

      return {
        ...user.toJSON(),
        accessToken,
        refreshToken,
      } as any;
    } catch (error) {
      // Rollback the transaction for any error
      await transaction.rollback();

      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Email already exists');
      }
      if (
        error instanceof Error &&
        error.message.includes('Failed to send verification email')
      ) {
        throw new InternalServerErrorException(
          'Failed to send verification email. Please try again later.',
        );
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwtData: IJwtData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    const [accessToken, refreshToken] =
      await this.tokenService.getTokens(jwtData);

    // Hash the refresh token and store it
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await user.update({ hashedRefreshToken });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userModel.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = this.verificationTokenService.generateToken();
    const verificationExpires =
      this.verificationTokenService.getExpirationDate();

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );
  }

  async signupStudent(createStudentDto: CreateStudentDto): Promise<User> {
    const transaction = await this.userModel.sequelize!.transaction();
    let user: User;

    try {
      const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);
      const verificationToken = this.verificationTokenService.generateToken();
      const verificationExpires =
        this.verificationTokenService.getExpirationDate();

      user = await this.userModel.create(
        {
          ...createStudentDto,
          password: hashedPassword,
          role: 'student',
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        } as CreationAttributes<User>,
        { transaction },
      );

      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
      );
      await transaction.commit();

      return user;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async signupInstructor(
    createInstructorDto: CreateInstructorDto,
  ): Promise<User> {
    const transaction = await this.userModel.sequelize!.transaction();
    let user: User;

    try {
      const hashedPassword = await bcrypt.hash(
        createInstructorDto.password,
        10,
      );
      const verificationToken = this.verificationTokenService.generateToken();
      const verificationExpires =
        this.verificationTokenService.getExpirationDate();

      user = await this.userModel.create(
        {
          ...createInstructorDto,
          password: hashedPassword,
          role: 'instructor',
          instructorStatus: 'pending',
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        } as CreationAttributes<User>,
        { transaction },
      );

      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
      );
      await transaction.commit();

      return user;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async approveInstructor(
    instructorId: string,
    adminId: string,
  ): Promise<User> {
    const admin = await this.userModel.findByPk(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Only admins can approve instructors');
    }

    const instructor = await this.userModel.findByPk(instructorId);
    if (!instructor) {
      throw new BadRequestException('Instructor not found');
    }

    if (instructor.role !== 'instructor') {
      throw new BadRequestException('User is not an instructor');
    }

    if (instructor.instructorStatus === 'approved') {
      throw new BadRequestException('Instructor is already approved');
    }

    instructor.instructorStatus = 'approved';
    await instructor.save();

    return instructor;
  }

  async rejectInstructor(instructorId: string, adminId: string): Promise<User> {
    const admin = await this.userModel.findByPk(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Only admins can reject instructors');
    }

    const instructor = await this.userModel.findByPk(instructorId);
    if (!instructor) {
      throw new BadRequestException('Instructor not found');
    }

    if (instructor.role !== 'instructor') {
      throw new BadRequestException('User is not an instructor');
    }

    if (instructor.instructorStatus === 'rejected') {
      throw new BadRequestException('Instructor is already rejected');
    }

    instructor.instructorStatus = 'rejected';
    await instructor.save();

    return instructor;
  }

  async getPendingInstructors(): Promise<User[]> {
    return this.userModel.findAll({
      where: {
        role: 'instructor',
        instructorStatus: 'pending',
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findOne(id: string, requestingUserId?: string, requestingUserRole?: string): Promise<User> {
    // If requesting user is provided, check if they're an admin or requesting their own ID
    if (requestingUserId && requestingUserRole !== 'admin') {
      // If not admin, only allow looking up their own ID
      if (requestingUserId !== id) {
        throw new ForbiddenException('You can only look up your own details');
      }
    }

    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async update(id: string, updateDto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);

    // Prevent password updates through this method
    if ('password' in updateDto) {
      delete updateDto.password;
    }

    await user.update(updateDto);
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }

  async findByEmail(email: string, requestingUserId?: string, requestingUserRole?: string): Promise<User> {
    // If requesting user is provided, check if they're an admin or requesting their own email
    if (requestingUserId && requestingUserRole !== 'admin') {
      const requestingUser = await this.userModel.findByPk(requestingUserId);
      if (!requestingUser) {
        throw new BadRequestException('Requesting user not found');
      }
      // If not admin, only allow looking up their own email
      if (requestingUser.email !== email) {
        throw new ForbiddenException('You can only look up your own details');
      }
    }

    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getCurrentUser(userId: string): Promise<User> {
    console.log('Looking up user with ID:', userId);
    
    const user = await this.userModel.findByPk(userId, {
      attributes: {
        exclude: ['password', 'emailVerificationToken', 'emailVerificationExpires'],
      },
    });
    
    console.log('Found user:', user ? 'yes' : 'no');
    
    if (!user) {
      console.log('User not found in database. ID:', userId);
      throw new BadRequestException('User not found');
    }
    
    return user;
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      // Verify the refresh token
      const tokenDetails = await this.tokenService.verifyToken(refreshTokenDto.refreshToken);
      
      // Find the user
      const user = await this.userModel.findByPk(tokenDetails.id);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verify the stored hashed refresh token
      const isRefreshTokenValid = await bcrypt.compare(
        refreshTokenDto.refreshToken,
        user.hashedRefreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const jwtData: IJwtData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      const [newAccessToken, newRefreshToken] = await this.tokenService.getTokens(jwtData);

      // Hash and store the new refresh token
      const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
      await user.update({ hashedRefreshToken });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Clear the stored refresh token
    await user.update({ hashedRefreshToken: null });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      // For security, do not reveal if the email exists
      return;
    }
    const resetToken = this.verificationTokenService.generateToken();
    const resetExpires = this.verificationTokenService.getExpirationDate();
    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }
  
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new BadRequestException('Password reset token is required');
    }
    if (!newPassword || typeof newPassword !== 'string' || !newPassword.trim()) {
      throw new BadRequestException('New password is required');
    }
    console.log('Token received for password reset:', token);
    const user = await this.userModel.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [Op.gt]: new Date() },
      },
    });
    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }
}
