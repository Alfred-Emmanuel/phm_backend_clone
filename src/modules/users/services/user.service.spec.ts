import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { CreateStudentDto } from '../dto/create-student.dto';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../../../shared/services/token.service';
import { EmailService } from '../../../shared/services/email.service';
import { VerificationTokenService } from '../../../shared/services/verification-token.service';
import { UniqueConstraintError } from 'sequelize';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let userModel: any;
  let tokenService: any;
  let emailService: any;
  let verificationTokenService: any;

  const baseMockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: 'student',
    instructorStatus: null,
  };

  const mockUser = {
    ...baseMockUser,
    toJSON: jest.fn().mockReturnThis(),
    update: jest.fn().mockResolvedValue(baseMockUser),
    destroy: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(baseMockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findAll: jest.fn().mockResolvedValue([mockUser]),
            findByPk: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(mockUser),
            destroy: jest.fn().mockResolvedValue(true),
            findOne: jest.fn().mockResolvedValue(null),
            sequelize: {
              transaction: jest.fn().mockResolvedValue({
                commit: jest.fn().mockResolvedValue(true),
                rollback: jest.fn().mockResolvedValue(true),
              }),
            },
          },
        },
        {
          provide: TokenService,
          useValue: {
            getTokens: jest
              .fn()
              .mockResolvedValue(['access-token', 'refresh-token']),
            generateToken: jest.fn().mockResolvedValue('mock-token'),
            verifyToken: jest.fn().mockResolvedValue({ userId: '1' }),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn().mockResolvedValue(true),
            sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: VerificationTokenService,
          useValue: {
            generateToken: jest.fn().mockReturnValue('mock-verification-token'),
            getExpirationDate: jest.fn().mockReturnValue(new Date()),
            create: jest.fn().mockResolvedValue({ token: 'mock-token' }),
            verify: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User));
    tokenService = module.get(TokenService);
    emailService = module.get(EmailService);
    verificationTokenService = module.get(VerificationTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto: CreateStudentDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.create(createDto);

      expect(result).toEqual({
        ...mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(userModel.create).toHaveBeenCalledWith(
        {
          ...createDto,
          password: hashedPassword,
          emailVerificationToken: 'mock-verification-token',
          emailVerificationExpires: expect.any(Date),
        },
        { transaction: expect.any(Object) },
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const createDto: CreateStudentDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Mock create to throw UniqueConstraintError
      jest
        .spyOn(userModel, 'create')
        .mockRejectedValue(new UniqueConstraintError({}));

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(userModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
      expect(userModel.findByPk).toHaveBeenCalledWith('1');
    });

    it('should throw BadRequestException if user not found', async () => {
      jest.spyOn(userModel, 'findByPk').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = {
        firstName: 'Jane',
      };

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockUser);
      expect(mockUser.update).toHaveBeenCalledWith(updateDto);
    });

    it('should hash password if provided in update', async () => {
      const updateDto = {
        password: 'newPassword',
      };

      const hashedPassword = 'hashedNewPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Reset the mock to ensure we're starting fresh
      (bcrypt.hash as jest.Mock).mockClear();

      await service.update('1', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(updateDto.password, 10);
      expect(mockUser.update).toHaveBeenCalledWith({
        password: hashedPassword,
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      await service.remove('1');

      expect(mockUser.destroy).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser);
      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should throw BadRequestException if user not found', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(
        service.findByEmail('nonexistent@example.com'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateUser', () => {
    it('should validate user credentials', async () => {
      const email = 'john@example.com';
      const password = 'password123';

      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(mockUser);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const email = 'john@example.com';
      const password = 'wrongPassword';

      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('updateInstructorStatus', () => {
    it('should update instructor status', async () => {
      const userId = '1';
      const adminId = '2';

      const mockAdmin = { ...mockUser, role: 'admin' };
      const mockInstructor = {
        ...mockUser,
        role: 'instructor',
        instructorStatus: 'pending',
      };

      jest
        .spyOn(userModel, 'findByPk')
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(mockInstructor);

      const result = await service.approveInstructor(userId, adminId);

      expect(result).toEqual(mockInstructor);
      expect(mockInstructor.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const userId = '1';
      const adminId = '2';

      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser);

      await expect(service.approveInstructor(userId, adminId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if user is not an instructor', async () => {
      const userId = '1';
      const adminId = '2';

      const mockAdmin = { ...mockUser, role: 'admin' };
      const mockStudent = { ...mockUser, role: 'student' };

      jest
        .spyOn(userModel, 'findByPk')
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(mockStudent);

      await expect(service.approveInstructor(userId, adminId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
