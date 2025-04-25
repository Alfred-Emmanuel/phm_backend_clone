import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  Index
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { CourseCategory } from '../../categories/entities/course-category.entity';

@Table({
  tableName: 'courses',
  timestamps: true,

    indexes: [
    { name: 'idx_instructor_id', fields: ['instructor_id'] }, // Correct field name
    { name: 'idx_is_free', fields: ['is_free'] },           // Correct field name
    { name: 'idx_level', fields: ['level'] },               // Correct field name
    { name: 'idx_status', fields: ['status'] },             // Correct field name
    // Add any other single or composite indexes here
    // { name: 'idx_composite_example', fields: ['status', 'level'] },
  ]
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
    type: DataType.NUMBER,
    allowNull: false,
    defaultValue: 0.00,
  })
  declare price: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: "is_free",
    defaultValue: true,
  })
  declare isFree: boolean;

  @Column({
    type: DataType.NUMBER,
    allowNull: true,
  })
  declare duration: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: "featured_image"
  })
  declare featuredImage: string;

  @Column({
    type: DataType.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: true,
  })
  declare level: 'beginner' | 'intermediate' | 'advanced';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare requirements: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: "learning_outcomes"
  })
  declare learningOutcomes: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: "target_audience"
  })
  declare targetAudience: string;

  @Column({
    type: DataType.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'published'
  })
  declare status: 'draft' | 'published' | 'archived';

  @Column({
    type: DataType.NUMBER,
    allowNull: false,
    defaultValue: 0,
    field: "enrollment_count"
  })
  declare enrollmentCount: number;

  @Column({
    type: DataType.NUMBER,
    defaultValue: 0,
    field: "max_position"
  })
  maxPosition: number;

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
