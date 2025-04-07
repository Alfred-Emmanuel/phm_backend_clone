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
  tableName: 'lessons',
  timestamps: true,
})
export class Lesson extends Model<Lesson> {
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
  declare content: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare videoUrl: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare position: number;

  @BelongsTo(() => Course, 'courseId')
  declare course: Course;
}
