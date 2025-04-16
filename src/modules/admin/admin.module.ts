import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { User } from '../users/entities/user.entity';
import { Admin } from './entities/admin.entity';
import { AdminActionLog } from './entities/admin-action-log.entity';
import { CourseEnrollment } from '../course-enrollments/entities/course-enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Assignment } from '../assignments/entities/assignment.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Admin,
      AdminActionLog,
      CourseEnrollment,
      Course,
      Lesson,
      Assignment,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {} 