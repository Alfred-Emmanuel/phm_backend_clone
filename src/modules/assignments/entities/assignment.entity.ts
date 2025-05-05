import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Course } from '../../courses/entities/course.entity';

@Table({
  tableName: 'assignments',
  timestamps: true,
})
export class Assignment extends Model<Assignment> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "course_id"
  })
  declare courseId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: "due_date"
  })
  declare dueDate: Date;

    @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'created_at'
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'updated_at'
  })
  declare updatedAt: Date;

  @BelongsTo(() => Course, 'courseId')
  declare course: Course;
}
