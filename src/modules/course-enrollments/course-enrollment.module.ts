import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { CourseEnrollmentController } from './controllers/course-enrollment.controller';
import { CourseEnrollmentService } from './services/course-enrollment.service';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [SequelizeModule.forFeature([CourseEnrollment, User, Course])],
  controllers: [CourseEnrollmentController],
  providers: [CourseEnrollmentService],
  exports: [CourseEnrollmentService],
})
export class CourseEnrollmentModule {}
