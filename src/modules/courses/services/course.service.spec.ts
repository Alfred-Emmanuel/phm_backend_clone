import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { getModelToken } from '@nestjs/sequelize';
import { Course } from '../entities/course.entity';
import { User } from '../../users/entities/user.entity';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCourseDto } from '../dto/create-course.dto';

describe('CourseService', () => {
  let service: CourseService;
  let courseModel: any;
  let userModel: any;

  const mockCourse = {
    id: '1',
    title: 'Test Course',
    description: 'Test Description',
    instructorId: '1',
    instructor: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    update: jest.fn().mockImplementation(async (dto) => {
      Object.assign(mockCourse, dto);
      return mockCourse;
    }),
    destroy: jest.fn().mockResolvedValue(true),
  };

  const mockInstructor = {
    id: '1',
    role: 'instructor',
    instructorStatus: 'approved',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getModelToken(Course),
          useValue: {
            create: jest.fn().mockResolvedValue(mockCourse),
            findAll: jest.fn().mockResolvedValue([mockCourse]),
            findByPk: jest.fn().mockResolvedValue(mockCourse),
            update: jest.fn().mockResolvedValue(mockCourse),
            destroy: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: getModelToken(User),
          useValue: {
            findByPk: jest.fn().mockResolvedValue(mockInstructor),
          },
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    courseModel = module.get(getModelToken(Course));
    userModel = module.get(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const createDto = {
        title: 'Test Course',
        description: 'Test Description',
        instructorId: '1',
      };

      const result = await service.create(createDto);

      expect(result).toEqual(mockCourse);
      expect(userModel.findByPk).toHaveBeenCalledWith(createDto.instructorId);
      expect(courseModel.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw NotFoundException if instructor not found', async () => {
      const createDto = {
        title: 'Test Course',
        instructorId: '1',
      };

      jest.spyOn(userModel, 'findByPk').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user is not an instructor', async () => {
      const createDto = {
        title: 'Test Course',
        instructorId: '1',
      };

      jest.spyOn(userModel, 'findByPk').mockResolvedValue({
        ...mockInstructor,
        role: 'student',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if instructor is not approved', async () => {
      const createDto = {
        title: 'Test Course',
        instructorId: '1',
      };

      jest.spyOn(userModel, 'findByPk').mockResolvedValue({
        ...mockInstructor,
        instructorStatus: 'pending',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockCourse]);
      expect(courseModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      jest.spyOn(courseModel, 'findByPk').mockResolvedValue(mockCourse);

      const result = await service.findOne('1');

      expect(result).toEqual(mockCourse);
      expect(courseModel.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });
    });

    it('should throw NotFoundException if course not found', async () => {
      jest.spyOn(courseModel, 'findByPk').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const updateDto: Partial<CreateCourseDto> = {
        title: 'Updated Course',
        description: 'Updated Description',
      };

      jest.spyOn(courseModel, 'findByPk').mockResolvedValue(mockCourse);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(mockCourse);
      expect(courseModel.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });
      expect(mockCourse.update).toHaveBeenCalledWith(updateDto);
    });

    it('should validate new instructor when updating instructorId', async () => {
      const updateDto = {
        instructorId: '2',
      };

      jest.spyOn(userModel, 'findByPk').mockResolvedValue({
        ...mockInstructor,
        role: 'student',
      });

      await expect(service.update('1', updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a course', async () => {
      jest.spyOn(courseModel, 'findByPk').mockResolvedValue(mockCourse);

      await service.remove('1');

      expect(courseModel.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });
      expect(mockCourse.destroy).toHaveBeenCalled();
    });
  });

  describe('findByInstructor', () => {
    it('should return courses for an instructor', async () => {
      const result = await service.findByInstructor('1');

      expect(result).toEqual([mockCourse]);
      expect(courseModel.findAll).toHaveBeenCalledWith({
        where: { instructorId: '1' },
        include: expect.any(Array),
      });
    });
  });
});
