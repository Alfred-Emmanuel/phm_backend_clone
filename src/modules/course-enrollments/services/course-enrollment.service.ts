import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CourseEnrollment } from '../entities/course-enrollment.entity';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Injectable()
export class CourseEnrollmentService {
  constructor(
    @InjectModel(CourseEnrollment)
    private enrollmentModel: typeof CourseEnrollment,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Course)
    private courseModel: typeof Course,
  ) {}

  async create(
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<CourseEnrollment> {
    const user = await this.userModel.findByPk(createEnrollmentDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'student') {
      throw new BadRequestException('Only students can enroll in courses');
    }

    const course = await this.courseModel.findByPk(
      createEnrollmentDto.courseId,
    );
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if student is already enrolled
    const existingEnrollment = await this.enrollmentModel.findOne({
      where: {
        userId: createEnrollmentDto.userId,
        courseId: createEnrollmentDto.courseId,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this course');
    }

    return this.enrollmentModel.create(createEnrollmentDto as any);
  }

  async findAll(): Promise<CourseEnrollment[]> {
    return this.enrollmentModel.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<CourseEnrollment> {
    const enrollment = await this.enrollmentModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description'],
        },
      ],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.findOne(id);
    await enrollment.destroy();
  }

  async findByUser(userId: string): Promise<CourseEnrollment[]> {
    return this.enrollmentModel.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description'],
        },
      ],
    });
  }

  async findByCourse(courseId: string): Promise<CourseEnrollment[]> {
    return this.enrollmentModel.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  async update(
    id: string,
    updateDto: Partial<CreateEnrollmentDto>,
  ): Promise<CourseEnrollment> {
    const enrollment = await this.findOne(id);
    await enrollment.update(updateDto);
    return enrollment;
  }
}
