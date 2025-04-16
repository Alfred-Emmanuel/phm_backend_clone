import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../../users/entities/user.entity';
import { AdminActionLog } from '../entities/admin-action-log.entity';
import { BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let userModel: any;
  let adminActionLogModel: any;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    role: 'instructor',
    instructorStatus: 'pending',
    save: jest.fn(),
  };

  const mockAdminActionLog = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getModelToken(User),
          useValue: {
            findByPk: jest.fn(),
          },
        },
        {
          provide: getModelToken(AdminActionLog),
          useValue: mockAdminActionLog,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userModel = module.get(getModelToken(User));
    adminActionLogModel = module.get(getModelToken(AdminActionLog));
  });

  describe('approveInstructor', () => {
    it('should approve an instructor successfully', async () => {
      // Setup
      const instructorId = '123e4567-e89b-12d3-a456-426614174000';
      const adminUserId = 'admin-123';
      userModel.findByPk.mockResolvedValue(mockUser);
      mockUser.save.mockResolvedValue(mockUser);

      // Execute
      const result = await service.approveInstructor(instructorId, adminUserId);

      // Assert
      expect(userModel.findByPk).toHaveBeenCalledWith(instructorId);
      expect(mockUser.instructorStatus).toBe('approved');
      expect(mockUser.save).toHaveBeenCalled();
      expect(adminActionLogModel.create).toHaveBeenCalledWith({
        adminUserId,
        actionType: 'approve_instructor',
        targetType: 'user',
        targetId: instructorId,
        details: {
          previousStatus: 'pending',
          newStatus: 'approved',
        },
      });
      expect(result).toBe(mockUser);
    });

    it('should throw BadRequestException if instructor not found', async () => {
      // Setup
      const instructorId = 'non-existent-id';
      const adminUserId = 'admin-123';
      userModel.findByPk.mockResolvedValue(null);

      // Execute & Assert
      await expect(service.approveInstructor(instructorId, adminUserId)).rejects.toThrow(
        new BadRequestException('Instructor not found'),
      );
    });

    it('should throw BadRequestException if user is not an instructor', async () => {
      // Setup
      const instructorId = '123e4567-e89b-12d3-a456-426614174000';
      const adminUserId = 'admin-123';
      const nonInstructorUser = {
        ...mockUser,
        role: 'student',
      };
      userModel.findByPk.mockResolvedValue(nonInstructorUser);

      // Execute & Assert
      await expect(service.approveInstructor(instructorId, adminUserId)).rejects.toThrow(
        new BadRequestException('User is not an instructor'),
      );
    });

    it('should throw BadRequestException if instructor is already approved', async () => {
      // Setup
      const instructorId = '123e4567-e89b-12d3-a456-426614174000';
      const adminUserId = 'admin-123';
      const approvedInstructor = {
        ...mockUser,
        instructorStatus: 'approved',
      };
      userModel.findByPk.mockResolvedValue(approvedInstructor);

      // Execute & Assert
      await expect(service.approveInstructor(instructorId, adminUserId)).rejects.toThrow(
        new BadRequestException('Instructor is already approved'),
      );
    });
  });
}); 