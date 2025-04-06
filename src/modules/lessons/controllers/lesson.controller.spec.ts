import { Test, TestingModule } from '@nestjs/testing';
import { LessonController } from './lesson.controller';
import { LessonService } from '../services/lesson.service';
import { CreateLessonDto } from '../dto/create-lesson.dto';

describe('LessonController', () => {
  let controller: LessonController;
  let service: LessonService;

  const mockLesson = {
    id: '1',
    courseId: '1',
    title: 'Test Lesson',
    content: 'Test Content',
    videoUrl: 'https://example.com/video',
    position: 1,
    course: {
      id: '1',
      title: 'Test Course',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonController],
      providers: [
        {
          provide: LessonService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockLesson),
            findAll: jest.fn().mockResolvedValue([mockLesson]),
            findOne: jest.fn().mockResolvedValue(mockLesson),
            update: jest.fn().mockResolvedValue(mockLesson),
            remove: jest.fn().mockResolvedValue(undefined),
            findByCourse: jest.fn().mockResolvedValue([mockLesson]),
            reorderLessons: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<LessonController>(LessonController);
    service = module.get<LessonService>(LessonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a lesson', async () => {
      const createDto: CreateLessonDto = {
        courseId: '1',
        title: 'Test Lesson',
        content: 'Test Content',
        position: 1,
      };

      const result = await controller.create(createDto);

      expect(result).toEqual(mockLesson);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all lessons', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockLesson]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a lesson by id', async () => {
      const result = await controller.findOne('1');

      expect(result).toEqual(mockLesson);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const updateDto: Partial<CreateLessonDto> = {
        title: 'Updated Title',
      };

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockLesson);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a lesson', async () => {
      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('findByCourse', () => {
    it('should return lessons for a course', async () => {
      const result = await controller.findByCourse('1');

      expect(result).toEqual([mockLesson]);
      expect(service.findByCourse).toHaveBeenCalledWith('1');
    });
  });

  describe('reorderLessons', () => {
    it('should reorder lessons', async () => {
      const lessonIds = ['1', '2', '3'];

      await controller.reorderLessons('1', lessonIds);

      expect(service.reorderLessons).toHaveBeenCalledWith('1', lessonIds);
    });
  });
});
