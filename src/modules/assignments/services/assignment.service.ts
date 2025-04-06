import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Assignment } from '../entities/assignment.entity';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { Course } from '../../courses/entities/course.entity';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment)
    private assignmentModel: typeof Assignment,
    @InjectModel(Course)
    private courseModel: typeof Course,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const course = await this.courseModel.findByPk(
      createAssignmentDto.courseId,
    );
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.assignmentModel.create(createAssignmentDto as any);
  }

  async findAll(): Promise<Assignment[]> {
    return this.assignmentModel.findAll({
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentModel.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
        },
      ],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async update(
    id: string,
    updateAssignmentDto: Partial<CreateAssignmentDto>,
  ): Promise<Assignment> {
    const assignment = await this.findOne(id);

    if (
      updateAssignmentDto.courseId &&
      updateAssignmentDto.courseId !== assignment.courseId
    ) {
      const course = await this.courseModel.findByPk(
        updateAssignmentDto.courseId,
      );
      if (!course) {
        throw new NotFoundException('Course not found');
      }
    }

    await assignment.update(updateAssignmentDto);
    return assignment;
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.findOne(id);
    await assignment.destroy();
  }

  async findByCourse(courseId: string): Promise<Assignment[]> {
    return this.assignmentModel.findAll({
      where: { courseId },
      order: [['createdAt', 'DESC']],
    });
  }
}
