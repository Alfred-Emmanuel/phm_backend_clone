import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Lesson } from './entities/lesson.entity';
import { LessonController } from './controllers/lesson.controller';
import { LessonService } from './services/lesson.service';
import { Course } from '../courses/entities/course.entity';
import { UserLesson } from './entities/user-lesson.entity';
import { CourseEnrollmentModule } from '../course-enrollments/course-enrollment.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Lesson, Course, UserLesson]),
    CourseEnrollmentModule,
  ],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {} 