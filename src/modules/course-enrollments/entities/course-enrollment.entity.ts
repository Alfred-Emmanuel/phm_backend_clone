import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Table
export class CourseEnrollment extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare courseId: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare enrollmentDate: Date;

  @BelongsTo(() => User, 'userId')
  declare user: User;

  @BelongsTo(() => Course, 'courseId')
  declare course: Course;
}
