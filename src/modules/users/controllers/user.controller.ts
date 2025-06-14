import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Param,
  Put,
  Delete,
  Request,
  ParseUUIDPipe,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateStudentDto } from '../dto/create-student.dto';
import { CreateInstructorDto } from '../dto/create-instructor.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { User } from '../entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup/student')
  @UseInterceptors(FileInterceptor('userImage'))
  @ApiOperation({ summary: 'Register a new student' })
  @ApiResponse({
    status: 201,
    description: 'Student registered successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiBody({ type: CreateStudentDto })
  async signupStudent(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() userImage?: Express.Multer.File,
  ) {
    return this.userService.signupStudent(createStudentDto, userImage);
  }

  @Post('signup/instructor')
  @UseInterceptors(FileInterceptor('userImage'))
  @ApiOperation({ summary: 'Register a new instructor' })
  @ApiResponse({
    status: 201,
    description: 'Instructor registered successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiBody({ type: CreateInstructorDto })
  async signupInstructor(
    @Body() createInstructorDto: CreateInstructorDto,
    @UploadedFile() userImage?: Express.Multer.File,
  ) {
    return this.userService.signupInstructor(createInstructorDto, userImage);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken, user } = await this.userService.login(loginDto);
    
    // Set refresh token as HTTP-only cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    return {
      accessToken,
      user,
    };
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset', description: 'Sends a password reset email to the user if the email exists.' })
  @ApiResponse({ status: 200, description: 'If the email exists, a password reset email will be sent.' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } } } })
  async requestPasswordReset(@Body('email') email: string) {
    await this.userService.requestPasswordReset(email);
    return { message: 'If the email exists, a password reset email will be sent.' };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password', description: 'Resets the user password using a valid reset token passed as a query parameter.' })
  @ApiResponse({ status: 200, description: 'Password reset successful.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired password reset token.' })
  @ApiBody({ schema: { type: 'object', properties: { newPassword: { type: 'string', minLength: 6 } } } })
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.userService.resetPassword(token, newPassword);
    return { message: 'Password reset successful.' };
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string) {
    await this.userService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Resend verification email',
    description:
      'Requires JWT authentication. Send with Bearer token in Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'User not found or email already verified',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async resendVerification(@Body('userId') userId: string) {
    await this.userService.resendVerificationEmail(userId);
    return { message: 'Verification email sent successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get authenticated user details',
    description:
      'Returns the details of the currently authenticated user. Requires JWT authentication.',
  })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async getCurrentUser(@Request() req: any): Promise<User> {
    return this.userService.getCurrentUser(req.user.userId);
  }

  @Get('instructors/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all pending instructors',
    description:
      'Requires JWT authentication and admin role. Send with Bearer token in Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending instructors',
    type: [User],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getPendingInstructors(): Promise<User[]> {
    return this.userService.getPendingInstructors();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Requires JWT authentication and admin role. Send with Bearer token in Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [User],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Requires JWT authentication and admin role. Only admins can look up user details.',
  })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 400, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ): Promise<User> {
    return this.userService.findOne(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.userService.refreshTokens(refreshTokenDto);
    
    // Set new refresh token as HTTP-only cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken,
      user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Clears the refresh token and logs out the user. Requires JWT authentication.',
  })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async logout(
    @Request() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Clear the stored refresh token
    await this.userService.logout(req.user.userId);

    // Clear the refresh token cookie
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { message: 'Logout successful' };
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('userImage'))
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user',
    description:
      'Requires JWT authentication. Send with Bearer token in Authorization header.',
  })
  @ApiResponse({ status: 200, description: 'User updated', type: User })
  @ApiResponse({ status: 400, description: 'User not found' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiBody({ type: CreateUserDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: Partial<CreateUserDto>,
    @UploadedFile() userImage?: Express.Multer.File,
  ): Promise<User> {
    return this.userService.update(id, updateDto, userImage);
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user by email',
    description:
      'Requires JWT authentication and admin role. Only admins can look up user details.',
  })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 400, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findByEmail(
    @Param('email', new ParseUUIDPipe()) email: string,
    @Request() req: any,
  ): Promise<User> {
    return this.userService.findByEmail(
      email,
      req.user.userId,
      req.user.role,
    );
  }
}
