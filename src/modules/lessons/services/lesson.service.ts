import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lesson } from '../entities/lesson.entity';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { Course } from '../../courses/entities/course.entity';
import { Op } from 'sequelize';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
    @InjectModel(Course)
    private courseModel: typeof Course,
  ) {}

async create(courseId: string, createLessonDto: Partial<CreateLessonDto>): Promise<Lesson> {
  const course = await this.courseModel.findByPk(courseId);
  if (!course) {
    throw new NotFoundException('Course not found');
  }

  // Auto-assign position if not provided
  let position = createLessonDto.position;
  if (position === undefined || position === null) {
    // Use the stored max position in the course model instead of querying the lesson table
    position = (course.maxPosition ?? -1) + 1;
  } else {
    // If position is provided and exists, shift others
    const existingLesson = await this.lessonModel.findOne({
      where: {
        courseId,
        position,
      },
    });

    if (existingLesson) {
      // Perform a batch update to shift the positions of lessons greater than or equal to the new position
      await this.lessonModel.update(
        { position: this.lessonModel.sequelize?.literal('position + 1') },
        {
          where: {
            courseId,
            position: {
              [Op.gte]: position,
            },
          },
        },
      );
    }
  }

  // Auto-assign title if not provided
  const title = createLessonDto.title?.trim() || `Lesson ${position + 1}`;

  // Create the new lesson
  const newLesson = await this.lessonModel.create({
    ...createLessonDto,
    courseId,
    position,
    title,
  } as any);

  // After creating the lesson, update the maxPosition for the course
  await course.update({ maxPosition: position });

  return newLesson;
}

  async findAll(): Promise<Lesson[]> {
    return this.lessonModel.findAll({
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
        },
      ],
      order: [['position', 'ASC']],
    });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
        },
      ],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async update(
    id: string,
    updateLessonDto: Partial<CreateLessonDto>,
  ): Promise<Lesson> {
    const lesson = await this.findOne(id);

    if (
      updateLessonDto.courseId &&
      updateLessonDto.courseId !== lesson.courseId
    ) {
      const course = await this.courseModel.findByPk(updateLessonDto.courseId);
      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    if (
      updateLessonDto.position &&
      updateLessonDto.position !== lesson.position
    ) {
      // Handle position update
      if (updateLessonDto.position > lesson.position) {
        // Moving down
        await this.lessonModel.update(
          { position: this.lessonModel.sequelize?.literal('position - 1') },
          {
            where: {
              courseId: lesson.courseId,
              position: {
                [Op.gt]: lesson.position,
                [Op.lte]: updateLessonDto.position,
              },
            },
          },
        );
      } else {
        // Moving up
        await this.lessonModel.update(
          { position: this.lessonModel.sequelize?.literal('position + 1') },
          {
            where: {
              courseId: lesson.courseId,
              position: {
                [Op.gte]: updateLessonDto.position,
                [Op.lt]: lesson.position,
              },
            },
          },
        );
      }
    }

    await lesson.update(updateLessonDto);
    return lesson;
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.findOne(id);
    const courseId = lesson.courseId;
    const position = lesson.position;

    await lesson.destroy();

    // Reorder remaining lessons
    await this.lessonModel.update(
      { position: this.lessonModel.sequelize?.literal('position - 1') },
      {
        where: {
          courseId,
          position: {
            [Op.gt]: position,
          },
        },
      },
    );
  }

  async findByCourse(courseId: string): Promise<Lesson[]> {
    return this.lessonModel.findAll({
      where: { courseId },
      order: [['position', 'ASC']],
    });
  }

  async reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
    // Verify all lessons exist and belong to the course
    const lessons = await this.lessonModel.findAll({
      where: {
        id: lessonIds,
        courseId,
      },
    });

    if (lessons.length !== lessonIds.length) {
      throw new BadRequestException('Invalid lesson IDs or course ID');
    }

    // Update positions
    for (let i = 0; i < lessonIds.length; i++) {
      await this.lessonModel.update(
        { position: i },
        {
          where: {
            id: lessonIds[i],
          },
        },
      );
    }
  }
}
