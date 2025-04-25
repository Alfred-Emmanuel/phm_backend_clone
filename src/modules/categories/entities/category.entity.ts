import {
  Column,
  Model,
  Table,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { Course } from '../../courses/entities/course.entity';
import { CourseCategory } from './course-category.entity';

export enum CategoryType {
  PAID = 'paid',
  FREE = 'free',
  OTHER = 'other',
}

@Table({
  tableName: 'categories',
  timestamps: true,
})
export class Category extends Model<Category> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.ENUM(...Object.values(CategoryType)),
    allowNull: false,
  })
  declare type: CategoryType;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare slug: string;

  // Many-to-Many relationship with Course through CourseCategory
  @BelongsToMany(() => Course, () => CourseCategory)
  declare courses: Course[];

  // Timestamps
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: "created_at"
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: "updated_at"
  })
  declare updatedAt: Date;
} 