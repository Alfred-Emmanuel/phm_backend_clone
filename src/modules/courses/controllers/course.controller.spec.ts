import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from './course.controller';
import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dto/create-course.dto';

describe('CourseController', () => {
  let controller: CourseController;
  let service: CourseService;

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        {
          provide: CourseService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockCourse),
            findAll: jest.fn().mockResolvedValue([mockCourse]),
            findOne: jest.fn().mockResolvedValue(mockCourse),
            update: jest.fn().mockResolvedValue(mockCourse),
            remove: jest.fn().mockResolvedValue(undefined),
            findByInstructor: jest.fn().mockResolvedValue([mockCourse]),
          },
        },
      ],
    }).compile();

    controller = module.get<CourseController>(CourseController);
    service = module.get<CourseService>(CourseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const createDto: CreateCourseDto = {
        title: 'Test Course',
        description: 'Test Description',
        instructorId: '1',
      };

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCourse);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all courses', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockCourse]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const result = await controller.findOne('1');

      expect(result).toEqual(mockCourse);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const updateDto = {
        title: 'Updated Title',
      };

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockCourse);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a course', async () => {
      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('findByInstructor', () => {
    it('should return courses for an instructor', async () => {
      const result = await controller.findByInstructor('1');

      expect(result).toEqual([mockCourse]);
      expect(service.findByInstructor).toHaveBeenCalledWith('1');
    });
  });
});
