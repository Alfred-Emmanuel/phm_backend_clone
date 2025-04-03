import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Course } from './entities/course.entity';
import { CourseController } from './controllers/course.controller';
import { CourseService } from './services/course.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([Course, User])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
