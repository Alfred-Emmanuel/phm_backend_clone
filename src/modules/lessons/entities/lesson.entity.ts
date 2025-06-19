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
  declare content: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: "video_url"
  })
  declare videoUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'video_public_id',
  })
  declare videoPublicId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare position: number;

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

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'section_title',
  })
  declare sectionTitle: string;

  @BelongsTo(() => Course, 'courseId')
  declare course: Course;
}
