import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lesson } from '../entities/lesson.entity';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { Course } from '../../courses/entities/course.entity';
import { UserLesson } from '../entities/user-lesson.entity';
import { Op, CreationAttributes } from 'sequelize';
import { CourseEnrollmentService } from '../../course-enrollments/services/course-enrollment.service';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
    @InjectModel(Course)
    private courseModel: typeof Course,
    @InjectModel(UserLesson)
    private userLessonModel: typeof UserLesson,
    private readonly enrollmentService: CourseEnrollmentService,
  ) {}

  private async checkEnrollment(userId: string, courseId: string): Promise<void> {
    const enrollment = await this.enrollmentService.findByUser(userId);
    const isEnrolled = enrollment.some(e => e.courseId === courseId);
    
    if (!isEnrolled) {
      throw new ForbiddenException('You must be enrolled in this course to perform this action');
    }
  }

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
    // Only update if the new position is greater than the current maxPosition
    console.log('position:', position, 'course.maxPosition:', course.maxPosition);
    if (position > (course.maxPosition ?? -1)) {
      await course.update({ maxPosition: position });
    }

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

  async markLessonAsCompleted(userId: string, lessonId: string): Promise<UserLesson> {
    const lesson = await this.findOne(lessonId);

    if (!lesson) {
      throw new BadRequestException("Lesson not found!")
    }

    await this.checkEnrollment(userId, lesson.courseId);
    
    const [userLesson, created] = await this.userLessonModel.findOrCreate({
      where: {
        userId,
        lessonId,
      },
      defaults: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        startedAt: new Date(),
      } as CreationAttributes<UserLesson>,
    });

    if (!created) {
      userLesson.completed = true;
      userLesson.completedAt = new Date();
      await userLesson.save();
    }

    return userLesson;
  }

  async markLessonAsIncomplete(userId: string, lessonId: string): Promise<UserLesson> {
    const lesson = await this.findOne(lessonId);

    if (!lesson) {
      throw new BadRequestException("Lesson not found!")
    }

    await this.checkEnrollment(userId, lesson.courseId);
    
    const userLesson = await this.userLessonModel.findOne({
      where: {
        userId,
        lessonId,
      },
    });

    if (!userLesson) {
      throw new NotFoundException('User lesson record not found');
    }

    userLesson.completed = false;
    userLesson.completedAt = null;
    await userLesson.save();

    return userLesson;
  }

  async toggleBookmark(userId: string, lessonId: string): Promise<UserLesson> {
    const lesson = await this.findOne(lessonId);

    if (!lesson) {
      throw new BadRequestException("Lesson not found!")
    }

    await this.checkEnrollment(userId, lesson.courseId);
    
    const [userLesson, created] = await this.userLessonModel.findOrCreate({
      where: {
        userId,
        lessonId,
      },
      defaults: {
        userId,
        lessonId,
        isBookmarked: true,
        startedAt: new Date(),
      } as CreationAttributes<UserLesson>,
    });

    if (!created) {
      userLesson.isBookmarked = !userLesson.isBookmarked;
      await userLesson.save();
    }

    return userLesson;
  }

  async getUserLessonProgress(userId: string, courseId: string): Promise<{
    totalLessons: number;
    completedLessons: number;
    progress: number;
    lessons: Array<{
      id: string;
      title: string;
      position: number;
      completed: boolean;
      isBookmarked: boolean;
      completedAt: Date | null;
      startedAt: Date;
    }>;
  }> {
    await this.checkEnrollment(userId, courseId);

    const lessons = await this.findByCourse(courseId);
    const userLessons = await this.userLessonModel.findAll({
      where: {
        userId,
        lessonId: {
          [Op.in]: lessons.map(lesson => lesson.id),
        },
      },
    });

    const userLessonsMap = new Map(
      userLessons.map(ul => [ul.lessonId, ul])
    );

    const completedLessons = userLessons.filter(ul => ul.completed).length;
    const totalLessons = lessons.length;
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    const lessonProgress = lessons.map(lesson => {
      const userLesson = userLessonsMap.get(lesson.id);
      return {
        id: lesson.id,
        title: lesson.title,
        position: lesson.position,
        completed: userLesson?.completed || false,
        isBookmarked: userLesson?.isBookmarked || false,
        completedAt: userLesson?.completedAt || null,
        startedAt: userLesson?.startedAt || new Date(),
      };
    });

    return {
      totalLessons,
      completedLessons,
      progress,
      lessons: lessonProgress,
    };
  }

  async startLesson(userId: string, lessonId: string): Promise<UserLesson> {
    const lesson = await this.findOne(lessonId);
    
    await this.checkEnrollment(userId, lesson.courseId);
    
    const [userLesson, created] = await this.userLessonModel.findOrCreate({
      where: {
        userId,
        lessonId,
      },
      defaults: {
        userId,
        lessonId,
        startedAt: new Date(),
      } as CreationAttributes<UserLesson>,
    });

    return userLesson;
  }
}
