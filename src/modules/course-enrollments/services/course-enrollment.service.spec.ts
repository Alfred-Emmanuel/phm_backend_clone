import { Test, TestingModule } from '@nestjs/testing';
import { CourseEnrollmentService } from './course-enrollment.service';
import { getModelToken } from '@nestjs/sequelize';
import { CourseEnrollment } from '../entities/course-enrollment.entity';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';

describe('CourseEnrollmentService', () => {
  let service: CourseEnrollmentService;
  let enrollmentModel: any;
  let courseModel: any;
  let userModel: any;

  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'student',
  };

  const mockCourse = {
    id: '1',
    title: 'Test Course',
    description: 'Test Description',
  };

  const mockEnrollment = {
    id: '1',
    userId: '1',
    courseId: '1',
    status: 'active',
    user: mockUser,
    course: mockCourse,
    update: jest.fn().mockImplementation(async (dto) => {
      Object.assign(mockEnrollment, dto);
      return mockEnrollment;
    }),
    destroy: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseEnrollmentService,
        {
          provide: getModelToken(CourseEnrollment),
          useValue: {
            create: jest.fn().mockResolvedValue(mockEnrollment),
            findAll: jest.fn().mockResolvedValue([mockEnrollment]),
            findByPk: jest.fn().mockResolvedValue(mockEnrollment),
            update: jest.fn().mockResolvedValue(mockEnrollment),
            destroy: jest.fn().mockResolvedValue(true),
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getModelToken(Course),
          useValue: {
            findByPk: jest.fn().mockResolvedValue(mockCourse),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findByPk: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<CourseEnrollmentService>(CourseEnrollmentService);
    enrollmentModel = module.get(getModelToken(CourseEnrollment));
    courseModel = module.get(getModelToken(Course));
    userModel = module.get(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an enrollment', async () => {
      const createDto = {
        userId: '1',
        courseId: '1',
      };

      jest.spyOn(userModel, 'findByPk').mockResolvedValue(mockUser);
      jest.spyOn(courseModel, 'findByPk').mockResolvedValue(mockCourse);
      jest.spyOn(enrollmentModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(enrollmentModel, 'create').mockResolvedValue(mockEnrollment);

      const result = await service.create(createDto);

      expect(result).toEqual(mockEnrollment);
      expect(userModel.findByPk).toHaveBeenCalledWith(createDto.userId);
      expect(courseModel.findByPk).toHaveBeenCalledWith(createDto.courseId);
      expect(enrollmentModel.findOne).toHaveBeenCalledWith({
        where: {
          userId: createDto.userId,
          courseId: createDto.courseId,
        },
      });
      expect(enrollmentModel.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      const createDto = {
        userId: '1',
        courseId: '1',
      };

      jest.spyOn(userModel, 'findByPk').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if course not found', async () => {
      const createDto = {
        userId: '1',
        courseId: '1',
      };

      jest.spyOn(courseModel, 'findByPk').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if enrollment already exists', async () => {
      const createDto = {
        userId: '1',
        courseId: '1',
      };

      jest.spyOn(enrollmentModel, 'findOne').mockResolvedValue(mockEnrollment);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all enrollments', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockEnrollment]);
      expect(enrollmentModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an enrollment by id', async () => {
      jest.spyOn(enrollmentModel, 'findByPk').mockResolvedValue(mockEnrollment);

      const result = await service.findOne('1');

      expect(result).toEqual(mockEnrollment);
      expect(enrollmentModel.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'description'],
          },
        ],
      });
    });

    it('should throw NotFoundException if enrollment not found', async () => {
      jest.spyOn(enrollmentModel, 'findByPk').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an enrollment', async () => {
      const updateDto: Partial<CreateEnrollmentDto> = {
        userId: '2',
        courseId: '2',
      };

      jest.spyOn(enrollmentModel, 'findByPk').mockResolvedValue(mockEnrollment);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockEnrollment);
      expect(enrollmentModel.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'description'],
          },
        ],
      });
      expect(mockEnrollment.update).toHaveBeenCalledWith(updateDto);
    });
  });

  describe('remove', () => {
    it('should remove an enrollment', async () => {
      jest.spyOn(enrollmentModel, 'findByPk').mockResolvedValue(mockEnrollment);

      await service.remove('1');

      expect(enrollmentModel.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'description'],
          },
        ],
      });
      expect(mockEnrollment.destroy).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return enrollments for a user', async () => {
      const result = await service.findByUser('1');

      expect(result).toEqual([mockEnrollment]);
      expect(enrollmentModel.findAll).toHaveBeenCalledWith({
        where: { userId: '1' },
        include: expect.any(Array),
      });
    });
  });

  describe('findByCourse', () => {
    it('should return enrollments for a course', async () => {
      const result = await service.findByCourse('1');

      expect(result).toEqual([mockEnrollment]);
      expect(enrollmentModel.findAll).toHaveBeenCalledWith({
        where: { courseId: '1' },
        include: expect.any(Array),
      });
    });
  });
});
