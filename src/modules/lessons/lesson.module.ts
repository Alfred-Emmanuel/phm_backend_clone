import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Lesson } from './entities/lesson.entity';
import { LessonController } from './controllers/lesson.controller';
import { LessonService } from './services/lesson.service';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [SequelizeModule.forFeature([Lesson, Course])],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {} 