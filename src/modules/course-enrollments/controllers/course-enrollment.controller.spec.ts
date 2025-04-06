import { Test, TestingModule } from '@nestjs/testing';
import { CourseEnrollmentController } from './course-enrollment.controller';
import { CourseEnrollmentService } from '../services/course-enrollment.service';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';

describe('CourseEnrollmentController', () => {
  let controller: CourseEnrollmentController;
  let service: CourseEnrollmentService;

  const mockEnrollment = {
    id: '1',
    userId: '1',
    courseId: '1',
    status: 'active',
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
    },
    course: {
      id: '1',
      title: 'Test Course',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseEnrollmentController],
      providers: [
        {
          provide: CourseEnrollmentService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockEnrollment),
            findAll: jest.fn().mockResolvedValue([mockEnrollment]),
            findOne: jest.fn().mockResolvedValue(mockEnrollment),
            update: jest.fn().mockResolvedValue(mockEnrollment),
            remove: jest.fn().mockResolvedValue(undefined),
            findByUser: jest.fn().mockResolvedValue([mockEnrollment]),
            findByCourse: jest.fn().mockResolvedValue([mockEnrollment]),
          },
        },
      ],
    }).compile();

    controller = module.get<CourseEnrollmentController>(
      CourseEnrollmentController,
    );
    service = module.get<CourseEnrollmentService>(CourseEnrollmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an enrollment', async () => {
      const createDto: CreateEnrollmentDto = {
        userId: '1',
        courseId: '1',
      };

      const result = await controller.create(createDto);

      expect(result).toEqual(mockEnrollment);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all enrollments', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockEnrollment]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an enrollment by id', async () => {
      const result = await controller.findOne('1');

      expect(result).toEqual(mockEnrollment);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update an enrollment', async () => {
      const updateDto: Partial<CreateEnrollmentDto> = {
        userId: '1',
        courseId: '1',
      };

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockEnrollment);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove an enrollment', async () => {
      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('findByUser', () => {
    it('should return enrollments for a user', async () => {
      const result = await controller.findByUser('1');

      expect(result).toEqual([mockEnrollment]);
      expect(service.findByUser).toHaveBeenCalledWith('1');
    });
  });

  describe('findByCourse', () => {
    it('should return enrollments for a course', async () => {
      const result = await controller.findByCourse('1');

      expect(result).toEqual([mockEnrollment]);
      expect(service.findByCourse).toHaveBeenCalledWith('1');
    });
  });
});
