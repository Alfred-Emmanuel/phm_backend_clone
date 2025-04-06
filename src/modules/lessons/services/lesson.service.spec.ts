import { Test, TestingModule } from '@nestjs/testing';
import { LessonService } from './lesson.service';
import { getModelToken } from '@nestjs/sequelize';
import { Lesson } from '../entities/lesson.entity';
import { Course } from '../../courses/entities/course.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';
import { CreateLessonDto } from '../dto/create-lesson.dto';

const mockLessonData = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  courseId: '123e4567-e89b-12d3-a456-426614174001',
  title: 'Test Lesson',
  content: 'Test Content',
  videoUrl: 'https://example.com/video',
  position: 1,
  course: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Test Course',
  },
};

const updatedLessonData = {
  ...mockLessonData,
  title: 'Updated Lesson',
  content: 'Updated Content',
  videoUrl: 'https://example.com/updated-video',
  courseId: '123e4567-e89b-12d3-a456-426614174001', // Ensure correct ID
};

const mockLesson = {
  ...mockLessonData,
  update: jest.fn().mockResolvedValue(updatedLessonData),
  destroy: jest.fn().mockResolvedValue(true),
};

describe('LessonService', () => {
  let service: LessonService;
  let lessonModel: any;
  let courseModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        {
          provide: getModelToken(Lesson),
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByPk: jest.fn(),
            update: jest.fn(),
            destroy: jest.fn(),
            findOne: jest.fn(),
            sequelize: {
              literal: jest.fn().mockReturnValue('position + 1'),
              Op,
            },
          },
        },
        {
          provide: getModelToken(Course),
          useValue: {
            findByPk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
    lessonModel = module.get(getModelToken(Lesson));
    courseModel = module.get(getModelToken(Course));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a lesson', async () => {
      const createDto: CreateLessonDto = {
        courseId: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Test Lesson',
        content: 'Test Content',
        videoUrl: 'https://example.com/video',
        position: 1,
      };

      jest
        .spyOn(courseModel, 'findByPk')
        .mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174001' });
      jest.spyOn(lessonModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(lessonModel, 'create').mockResolvedValue(mockLesson);

      const result = await service.create(createDto);

      expect(result).toEqual(mockLesson);
      expect(courseModel.findByPk).toHaveBeenCalledWith(createDto.courseId);
      expect(lessonModel.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw error if course not found', async () => {
      const createDto: CreateLessonDto = {
        courseId: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Test Lesson',
        content: 'Test Content',
        videoUrl: 'https://example.com/video',
        position: 1,
      };

      jest.spyOn(courseModel, 'findByPk').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        'Course not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return all lessons', async () => {
      jest.spyOn(lessonModel, 'findAll').mockResolvedValue([mockLesson]);

      const result = await service.findAll();

      expect(result).toEqual([mockLesson]);
      expect(lessonModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a lesson by id', async () => {
      jest.spyOn(lessonModel, 'findByPk').mockResolvedValue(mockLesson);

      const result = await service.findOne(
        '123e4567-e89b-12d3-a456-426614174000',
      );

      expect(result).toEqual(mockLesson);
      expect(lessonModel.findByPk).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title'],
            },
          ],
        },
      );
    });

    it('should throw error if lesson not found', async () => {
      jest.spyOn(lessonModel, 'findByPk').mockResolvedValue(null);

      await expect(
        service.findOne('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow('Lesson not found');
    });
  });

  describe('update', () => {
    it('should update a lesson', async () => {
      const updateDto: CreateLessonDto = {
        courseId: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Updated Lesson',
        content: 'Updated Content',
        videoUrl: 'https://example.com/updated-video',
        position: 1,
      };

      const mockLessonWithDifferentCourse = {
        ...mockLessonData,
        courseId: '123e4567-e89b-12d3-a456-426614174002',
        update: jest.fn().mockImplementation(async (dto) => {
          Object.assign(mockLessonWithDifferentCourse, dto);
          return mockLessonWithDifferentCourse;
        }),
        destroy: jest.fn().mockResolvedValue(true),
      };

      jest
        .spyOn(lessonModel, 'findByPk')
        .mockResolvedValue(mockLessonWithDifferentCourse);
      jest
        .spyOn(courseModel, 'findByPk')
        .mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174001' });

      const result = await service.update(
        '123e4567-e89b-12d3-a456-426614174000',
        updateDto,
      );

      expect(result).toEqual({
        ...mockLessonWithDifferentCourse,
        ...updateDto,
        course: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          title: 'Test Course',
        },
      });

      expect(lessonModel.findByPk).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          include: [
            { model: Course, as: 'course', attributes: ['id', 'title'] },
          ],
        },
      );

      expect(courseModel.findByPk).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174001',
      );
      expect(mockLessonWithDifferentCourse.update).toHaveBeenCalledWith(
        updateDto,
      );
    });

    it('should throw error if lesson not found', async () => {
      const updateDto: CreateLessonDto = {
        courseId: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Updated Lesson',
        content: 'Updated Content',
        videoUrl: 'https://example.com/updated-video',
        position: 1,
      };

      jest.spyOn(lessonModel, 'findByPk').mockResolvedValue(null);

      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174000', updateDto),
      ).rejects.toThrow('Lesson not found');
    });

    it('should throw error if course not found', async () => {
      const updateDto: CreateLessonDto = {
        courseId: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Updated Lesson',
        content: 'Updated Content',
        videoUrl: 'https://example.com/updated-video',
        position: 1,
      };

      const mockLessonWithDifferentCourse = {
        ...mockLessonData,
        courseId: '123e4567-e89b-12d3-a456-426614174002',
        update: jest.fn().mockResolvedValue(mockLessonData),
        destroy: jest.fn().mockResolvedValue(true),
      };

      jest
        .spyOn(lessonModel, 'findByPk')
        .mockResolvedValue(mockLessonWithDifferentCourse);
      jest.spyOn(courseModel, 'findByPk').mockResolvedValue(null);

      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174000', updateDto),
      ).rejects.toThrow('Course not found');
    });
  });

  describe('remove', () => {
    it('should remove a lesson', async () => {
      jest.spyOn(lessonModel, 'findByPk').mockResolvedValue(mockLesson);

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(lessonModel.findByPk).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title'],
            },
          ],
        },
      );
      expect(mockLesson.destroy).toHaveBeenCalled();
    });

    it('should throw error if lesson not found', async () => {
      jest.spyOn(lessonModel, 'findByPk').mockResolvedValue(null);

      await expect(
        service.remove('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow('Lesson not found');
    });
  });

  describe('findByCourse', () => {
    it('should return lessons by course id', async () => {
      jest.spyOn(lessonModel, 'findAll').mockResolvedValue([mockLesson]);

      const result = await service.findByCourse(
        '123e4567-e89b-12d3-a456-426614174001',
      );

      expect(result).toEqual([mockLesson]);
      expect(lessonModel.findAll).toHaveBeenCalledWith({
        where: { courseId: '123e4567-e89b-12d3-a456-426614174001' },
        order: [['position', 'ASC']],
      });
    });
  });

  describe('reorderLessons', () => {
    it('should reorder lessons', async () => {
      const courseId = '123e4567-e89b-12d3-a456-426614174001';
      const lessonIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174002',
        '123e4567-e89b-12d3-a456-426614174003',
      ];
      const mockLessons = lessonIds.map((id) => ({
        id,
        courseId,
        position: 0,
      }));

      jest.spyOn(lessonModel, 'findAll').mockResolvedValue(mockLessons);

      await service.reorderLessons(courseId, lessonIds);

      expect(lessonModel.findAll).toHaveBeenCalledWith({
        where: {
          id: lessonIds,
          courseId,
        },
      });

      for (let i = 0; i < lessonIds.length; i++) {
        expect(lessonModel.update).toHaveBeenCalledWith(
          { position: i },
          {
            where: {
              id: lessonIds[i],
            },
          },
        );
      }
    });
  });
});
