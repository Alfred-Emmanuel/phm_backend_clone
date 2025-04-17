import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { CourseCategory } from '../../categories/entities/course-category.entity';

@Table({
  tableName: 'courses',
  timestamps: true,
})
export class Course extends Model<Course> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

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

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'instructor_id'
  })
  declare instructorId: string;

  @BelongsTo(() => User, 'instructor_id')
  declare instructor: User;

  @BelongsToMany(() => Category, {
    through: () => CourseCategory,
    foreignKey: 'course_id',
    otherKey: 'category_id'
  })
  declare categories: Category[];

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
}
