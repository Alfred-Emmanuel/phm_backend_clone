import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesService } from './services/categories.service';
import { Category } from './entities/category.entity';
import { CourseCategory } from './entities/course-category.entity';
import { Course } from '../courses/entities/course.entity';
import { AdminActionLog } from '../admin/entities/admin-action-log.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Category,
      CourseCategory,
      Course,
      AdminActionLog,
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {} 