import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CourseEnrollment } from '../entities/course-enrollment.entity';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { PaymentsService } from '../../payments/services/payments.service';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class CourseEnrollmentService {
  constructor(
    @InjectModel(CourseEnrollment)
    private enrollmentModel: typeof CourseEnrollment,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Course)
    private courseModel: typeof Course,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
    private sequelize: Sequelize,
  ) {}

  async create(
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<any> {
    return await this.sequelize.transaction(async (t) => {
      const course = await this.courseModel.findByPk(
        createEnrollmentDto.courseId,
        { transaction: t }
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
        transaction: t,
      });
      if (existingEnrollment) {
        throw new ConflictException('Student is already enrolled in this course');
      }
      // Check if user exists
      const user = await this.userModel.findByPk(createEnrollmentDto.userId, { transaction: t });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      if (course.isFree) {
        const enrollment = await this.enrollmentModel.create(createEnrollmentDto as any, { transaction: t });
        await course.increment('enrollmentCount', { transaction: t });
        return enrollment;
      } else {
        // Paid course: initiate payment, do not enroll yet
        const payment = await this.paymentsService.initiatePayment({
          userId: createEnrollmentDto.userId,
          courseIds: [createEnrollmentDto.courseId],
          amount: course.price,
        });
        // Rollback transaction so nothing is saved until payment is verified
        throw new HttpException({
          paymentRequired: true,
          payment,
        }, 402);
      }
    });
  }

  async enrollAfterPayment(userId: string, courseId: string): Promise<CourseEnrollment> {
    // Check if already enrolled
    const existingEnrollment = await this.enrollmentModel.findOne({
      where: { userId, courseId },
    });
    if (existingEnrollment) {
      return existingEnrollment;
    }
    // Create enrollment (no payment logic)
    const enrollment = await this.enrollmentModel.create({ userId, courseId } as any);
    await this.courseModel.increment('enrollmentCount', { where: { id: courseId } });
    return enrollment;
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

  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const existingEnrollment = await this.enrollmentModel.findOne({
      where: { userId, courseId },
    });
    return !!existingEnrollment;
  }

  async bulkEnroll(userId: string, courseIds: string[]): Promise<any> {
    // Fetch all courses
    const courses = await this.courseModel.findAll({ where: { id: courseIds } });
    if (courses.length !== courseIds.length) {
      throw new NotFoundException('One or more courses not found');
    }
    // Check if user exists
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // Check for already enrolled courses
    const alreadyEnrolled = await this.enrollmentModel.findAll({
      where: { userId, courseId: courseIds },
    });
    const alreadyEnrolledIds = alreadyEnrolled.map(e => e.courseId);
    const toEnroll = courses.filter(c => !alreadyEnrolledIds.includes(c.id));
    if (toEnroll.length === 0) {
      throw new ConflictException('Student is already enrolled in all selected courses');
    }
    // Split free and paid courses
    const freeCourses = toEnroll.filter(c => c.isFree);
    const paidCourses = toEnroll.filter(c => !c.isFree);
    // Enroll in free courses immediately (commit outside transaction)
    for (const course of freeCourses) {
      await this.enrollmentModel.create({ userId, courseId: course.id } as any);
      await course.increment('enrollmentCount');
    }
    // If there are paid courses, check for existing pending payment before initiating new one
    if (paidCourses.length > 0) {
      // Check for existing pending payment for this user and these paid courses
      const payment = await this.paymentsService.initiatePayment({
        userId,
        courseIds: paidCourses.map(c => c.id),
        amount: paidCourses.reduce((sum, c) => sum + parseFloat(c.price as any), 0),
      });
      // Always throw 402 to indicate payment required, even if payment is reused
      throw new HttpException({
        paymentRequired: true,
        payment,
      }, 402);
    }
    // If only free courses, return success
    return { status: 'success', enrolled: freeCourses.map(c => c.id) };
  }
}
