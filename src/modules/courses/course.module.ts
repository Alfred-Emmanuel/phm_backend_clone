import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Course } from './entities/course.entity';
import { CourseController } from './controllers/course.controller';
import { CourseService } from './services/course.service';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { CourseCategory } from '../categories/entities/course-category.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Course, User, Category, CourseCategory,]),
    CloudinaryModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
