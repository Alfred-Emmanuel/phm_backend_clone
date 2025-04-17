import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Course } from '../../courses/entities/course.entity';
import { Category } from './category.entity';

@Table({
  tableName: 'course_categories',
  timestamps: false,
})
export class CourseCategory extends Model<CourseCategory> {
  @ForeignKey(() => Course)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    field: "course_id"
  })
  declare courseId: string;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    field: "category_id"
  })
  declare categoryId: string;
} 