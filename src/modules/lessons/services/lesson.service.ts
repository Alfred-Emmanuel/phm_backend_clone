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
// import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
// import { InternalServerErrorException } from '@nestjs/common';
import {Transaction} from 'sequelize';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
    // private cloudinaryService: CloudinaryService,
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

  /**
   * Returns allowed section titles for a course: always 'Introduction' first, then 'Chapter 1', 'Chapter 2', ...
   */
  async getAllowedSectionTitles(courseId: string): Promise<string[]> {
    const lessons = await this.lessonModel.findAll({
      where: { courseId },
      attributes: ['sectionTitle'],
      group: ['sectionTitle'],
      order: [['sectionTitle', 'ASC']],
    });
    const existingSections = lessons.map(l => l.sectionTitle).filter(Boolean);
    // Always include 'Introduction' at the top, even if it doesn't exist yet
    const allowedSections: string[] = ['Introduction'];
    // Find max chapter number
    const chapterNumbers = existingSections
      .filter(s => /^Chapter \d+$/i.test(s))
      .map(s => parseInt(s.replace(/Chapter /i, ''), 10))
      .filter(n => !isNaN(n));
    const nextChapter = chapterNumbers.length > 0 ? Math.max(...chapterNumbers) + 1 : 1;
    // Add all existing sections except Introduction (to avoid duplicate)
    allowedSections.push(...existingSections.filter(s => s !== 'Introduction'));
    // Add the next chapter if not already present
    const nextChapterTitle = `Chapter ${nextChapter}`;
    if (!allowedSections.includes(nextChapterTitle)) {
      allowedSections.push(nextChapterTitle);
    }
    return allowedSections;
  }

  async create(courseId: string, createLessonDto: Partial<CreateLessonDto>, videoUrl?: Express.Multer.File): Promise<Lesson> {
    const course = await this.courseModel.findByPk(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    // Remove strict sectionTitle validation, allow any string
    if (!createLessonDto.sectionTitle || typeof createLessonDto.sectionTitle !== 'string' || !createLessonDto.sectionTitle.trim()) {
      throw new BadRequestException('sectionTitle is required and must be a non-empty string');
    }
    const sectionTitle = createLessonDto.sectionTitle.trim();

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

    // if (videoUrl) {
    //   try {
    //     const uploadResult = await this.cloudinaryService.uploadVideo(
    //       videoUrl,
    //       'phm/lesson_videos'
    //     );
    //     createLessonDto.videoUrl = uploadResult.secure_url;
    //     createLessonDto.videoPublicId = uploadResult.public_id;
    //   } catch (error) {
    //     console.error('Cloudinary Upload Error:', error);
    //     throw new InternalServerErrorException('Image upload failed');
    //   }
    // }  

    // Create the new lesson
    const result = await this.lessonModel.sequelize?.transaction(async (t: Transaction) => {
      const newLesson = await this.lessonModel.create({
        ...createLessonDto,
        courseId,
        position,
        title,
        // videoUrl: createLessonDto.videoUrl, 
        // videoPublicId: createLessonDto.videoPublicId
      } as any,
      { transaction: t }
      );

  
      // After creating the lesson, update the maxPosition for the course
      // Only update if the new position is greater than the current maxPosition
      if (position > (course.maxPosition ?? -1)) {
        await course.update({ maxPosition: position });
      }
      return newLesson
    })

    return result!;
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

  /**
   * Returns lessons grouped by sectionTitle for a course
   */
  async findByCourseGrouped(courseId: string, user?: any): Promise<{ sectionTitle: string, lessons: any[] }[]> {
    const lessons = await this.lessonModel.findAll({
      where: { courseId },
      order: [['position', 'ASC']],
    });
    let isEnrolled = false;
    if (user && user.userId) {
      isEnrolled = await this.enrollmentService.isUserEnrolled(user.userId, courseId);
    }
    // Group by sectionTitle
    const grouped: Record<string, any[]> = {};
    for (const lesson of lessons) {
      const section = lesson.sectionTitle || 'Uncategorized';
      if (!grouped[section]) grouped[section] = [];
      if (isEnrolled) {
        grouped[section].push(lesson);
      } else {
        grouped[section].push({
          id: lesson.id,
          title: lesson.title,
          position: lesson.position,
          sectionTitle: lesson.sectionTitle,
        });
      }
    }
    return Object.entries(grouped).map(([sectionTitle, lessons]) => ({ sectionTitle, lessons }));
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
