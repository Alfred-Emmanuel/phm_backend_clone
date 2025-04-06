import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Assignment } from './entities/assignment.entity';
import { AssignmentController } from './controllers/assignment.controller';
import { AssignmentService } from './services/assignment.service';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [SequelizeModule.forFeature([Assignment, Course])],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
