import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from '../../users/entities/user.entity';
import { Admin } from '../entities/admin.entity';
import { AdminActionLog } from '../entities/admin-action-log.entity';
import { CourseEnrollment } from '../../course-enrollments/entities/course-enrollment.entity';
import { Course } from '../../courses/entities/course.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { FilterUsersDto } from '../dto/filter-users.dto';
import { FilterActionLogsDto } from '../dto/filter-action-logs.dto';
import { PaginatedActionLogsDto } from '../dto/paginated-action-logs.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Admin)
    private adminModel: typeof Admin,
    @InjectModel(AdminActionLog)
    private adminActionLogModel: typeof AdminActionLog,
    @InjectModel(CourseEnrollment)
    private enrollmentModel: typeof CourseEnrollment,
    @InjectModel(Course)
    private courseModel: typeof Course,
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
    @InjectModel(Assignment)
    private assignmentModel: typeof Assignment,
  ) {}

  async findAllUsers(filterDto?: FilterUsersDto): Promise<User[]> {
    const where: any = {};

    if (filterDto?.role) {
      where.role = filterDto.role;
    }

    if (filterDto?.status) {
      where.status = filterDto.status;
    }

    return this.userModel.findAll({
      where,
      include: [
        {
          model: Admin,
          as: 'admin',
          attributes: ['isSuperAdmin', 'jobTitle'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOneUser(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUserStatus(
    id: string,
    updateUserStatusDto: UpdateUserStatusDto,
    adminUserId: string,
  ): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const previousStatus = user.status;
    await user.update({ status: updateUserStatusDto.status });

    // Log the action
    await this.logAction(adminUserId, 'update_user_status', 'user', id, {
      previousStatus,
      newStatus: updateUserStatusDto.status,
    });

    return user;
  }

  async updateUserRole(
    id: string,
    updateUserRoleDto: UpdateUserRoleDto,
    adminUserId: string,
  ): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const previousRole = user.role;

    // Handle admin record management
    if (updateUserRoleDto.role === 'admin') {
      // Create admin record if promoting to admin
      await this.adminModel.create({
        userId: id,
        isSuperAdmin: false,
        jobTitle: null,
        permissions: null,
      } as any);
    } else if (previousRole === 'admin') {
      // Remove admin record if demoting from admin
      await this.adminModel.destroy({
        where: { userId: id },
      });
    }

    // Update user role
    await user.update({ role: updateUserRoleDto.role });

    // Log the action
    await this.logAction(adminUserId, 'update_user_role', 'user', id, {
      previousRole,
      newRole: updateUserRoleDto.role,
    });

    return user;
  }

  async getActionLogs(filterDto: FilterActionLogsDto): Promise<PaginatedActionLogsDto> {
    const { page = 1, limit = 10, actionType, targetType, targetId, adminUserId } = filterDto;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (actionType) where.actionType = actionType;
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    if (adminUserId) where.adminUserId = adminUserId;

    const { count, rows } = await this.adminActionLogModel.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'adminUser',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      items: rows,
      total: count,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async approveInstructor(
    instructorId: string,
    adminUserId: string,
  ): Promise<User> {
    const instructor = await this.userModel.findByPk(instructorId);
    if (!instructor) {
      throw new BadRequestException('Instructor not found');
    }

    if (instructor.role !== 'instructor') {
      throw new BadRequestException('User is not an instructor');
    }

    if (instructor.instructorStatus === 'approved') {
      throw new BadRequestException('Instructor is already approved');
    }

    instructor.instructorStatus = 'approved';
    await instructor.save();

    // Log the action
    await this.logAction(adminUserId, 'approve_instructor', 'user', instructorId, {
      previousStatus: instructor.instructorStatus,
      newStatus: 'approved',
    });

    return instructor;
  }

  async rejectInstructor(
    instructorId: string,
    adminUserId: string,
  ): Promise<User> {
    const instructor = await this.userModel.findByPk(instructorId);
    if (!instructor) {
      throw new BadRequestException('Instructor not found');
    }

    if (instructor.role !== 'instructor') {
      throw new BadRequestException('User is not an instructor');
    }

    if (instructor.instructorStatus === 'rejected') {
      throw new BadRequestException('Instructor is already rejected');
    }

    instructor.instructorStatus = 'rejected';
    await instructor.save();

    // Log the action
    await this.logAction(adminUserId, 'reject_instructor', 'user', instructorId, {
      previousStatus: instructor.instructorStatus,
      newStatus: 'rejected',
    });

    return instructor;
  }

  async deleteUser(
    userId: string,
    adminUserId: string,
  ): Promise<void> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Log the action before deletion
    await this.logAction(adminUserId, 'delete_user', 'user', userId, {
      userEmail: user.email,
      userRole: user.role,
      instructorStatus: user.instructorStatus,
    });

    await user.destroy();
  }

  private async logAction(
    adminUserId: string,
    actionType: string,
    targetType: string,
    targetId: string,
    details: object,
  ): Promise<void> {
    await this.adminActionLogModel.create({
      adminUserId,
      actionType,
      targetType,
      targetId,
      details,
    } as any);
  }

  async getAllEnrollments(): Promise<CourseEnrollment[]> {
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

  async deleteEnrollment(
    enrollmentId: string,
    adminUserId: string,
  ): Promise<void> {
    const enrollment = await this.enrollmentModel.findByPk(enrollmentId, {
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
      throw new BadRequestException('Enrollment not found');
    }

    // Log the action before deletion
    await this.logAction(adminUserId, 'delete_enrollment', 'enrollment', enrollmentId, {
      userId: enrollment.userId,
      userEmail: enrollment.user?.email,
      courseId: enrollment.courseId,
      courseTitle: enrollment.course?.title,
    });

    await enrollment.destroy();
  }

  async deleteLesson(
    lessonId: string,
    adminUserId: string,
  ): Promise<void> {
    const lesson = await this.lessonModel.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
        },
      ],
    });

    if (!lesson) {
      throw new BadRequestException('Lesson not found');
    }

    // Log the action before deletion
    await this.logAction(adminUserId, 'delete_lesson', 'lesson', lessonId, {
      lessonTitle: lesson.title,
      courseId: lesson.courseId,
      courseTitle: lesson.course?.title,
    });

    await lesson.destroy();

    // Reorder remaining lessons
    await this.lessonModel.update(
      { position: this.lessonModel.sequelize?.literal('position - 1') },
      {
        where: {
          courseId: lesson.courseId,
          position: {
            [Op.gt]: lesson.position,
          },
        },
      },
    );
  }

  async updateLesson(
    lessonId: string,
    updateData: any,
    adminUserId: string,
  ): Promise<Lesson> {
    const lesson = await this.lessonModel.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
        },
      ],
    });

    if (!lesson) {
      throw new BadRequestException('Lesson not found');
    }

    if (updateData.courseId && updateData.courseId !== lesson.courseId) {
      const course = await this.courseModel.findByPk(updateData.courseId);
      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    // Log the action
    await this.logAction(adminUserId, 'update_lesson', 'lesson', lessonId, {
      previousData: {
        title: lesson.title,
        courseId: lesson.courseId,
        position: lesson.position,
      },
      newData: updateData,
    });

    await lesson.update(updateData);
    return lesson;
  }

  async deleteAssignment(
    assignmentId: string,
    adminUserId: string,
  ): Promise<void> {
    const assignment = await this.assignmentModel.findByPk(assignmentId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
        },
      ],
    });

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    // Log the action before deletion
    await this.logAction(adminUserId, 'delete_assignment', 'assignment', assignmentId, {
      assignmentTitle: assignment.title,
      courseId: assignment.courseId,
      courseTitle: assignment.course?.title,
    });

    await assignment.destroy();
  }

  async updateAssignment(
    assignmentId: string,
    updateData: any,
    adminUserId: string,
  ): Promise<Assignment> {
    const assignment = await this.assignmentModel.findByPk(assignmentId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
        },
      ],
    });

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (updateData.courseId && updateData.courseId !== assignment.courseId) {
      const course = await this.courseModel.findByPk(updateData.courseId);
      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    // Log the action
    await this.logAction(adminUserId, 'update_assignment', 'assignment', assignmentId, {
      previousData: {
        title: assignment.title,
        courseId: assignment.courseId,
      },
      newData: updateData,
    });

    await assignment.update(updateData);
    return assignment;
  }

  async deleteCourse(
    courseId: string,
    adminUserId: string,
  ): Promise<void> {
    const course = await this.courseModel.findByPk(courseId, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    // Log the action before deletion
    await this.logAction(adminUserId, 'delete_course', 'course', courseId, {
      courseTitle: course.title,
      instructorId: course.instructorId,
      instructorEmail: course.instructor?.email,
    });

    await course.destroy();
  }

  async updateCourse(
    courseId: string,
    updateData: any,
    adminUserId: string,
  ): Promise<Course> {
    const course = await this.courseModel.findByPk(courseId, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    // Log the action
    await this.logAction(adminUserId, 'update_course', 'course', courseId, {
      previousData: {
        title: course.title,
        instructorId: course.instructorId,
      },
      newData: updateData,
    });

    await course.update(updateData);
    return course;
  }
} 