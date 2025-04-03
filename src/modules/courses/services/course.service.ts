import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Course } from '../entities/course.entity';
import { CreateCourseDto } from '../dto/create-course.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course)
    private courseModel: typeof Course,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const instructor = await this.userModel.findByPk(
      createCourseDto.instructorId,
    );

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    if (instructor.role !== 'instructor') {
      throw new BadRequestException('User is not an instructor');
    }

    if (instructor.instructorStatus !== 'approved') {
      throw new ForbiddenException('Instructor is not approved');
    }

    return this.courseModel.create(createCourseDto as any);
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.findAll({
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(
    id: string,
    updateCourseDto: Partial<CreateCourseDto>,
  ): Promise<Course> {
    const course = await this.findOne(id);

    if (updateCourseDto.instructorId) {
      const instructor = await this.userModel.findByPk(
        updateCourseDto.instructorId,
      );

      if (!instructor) {
        throw new NotFoundException('Instructor not found');
      }

      if (instructor.role !== 'instructor') {
        throw new BadRequestException('User is not an instructor');
      }

      if (instructor.instructorStatus !== 'approved') {
        throw new ForbiddenException('Instructor is not approved');
      }
    }

    await course.update(updateCourseDto);
    return course;
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await course.destroy();
  }

  async findByInstructor(instructorId: string): Promise<Course[]> {
    return this.courseModel.findAll({
      where: { instructorId },
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }
}
