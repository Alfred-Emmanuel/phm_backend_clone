import { Table, Column, Model, ForeignKey, BelongsTo, HasMany, DataType } from 'sequelize-typescript';
import { Course } from '../../courses/entities/course.entity';
import { QuizQuestion } from './quiz-question.entity';

@Table({ tableName: 'quizzes', timestamps: true })
export class Quiz extends Model<Quiz> {
  @ForeignKey(() => Course)
  @Column({ type: DataType.UUID, allowNull: false, unique: true, field: 'course_id' })
  declare courseId: string;

  @BelongsTo(() => Course)
  declare course: Course;

  @HasMany(() => QuizQuestion)
  declare questions: QuizQuestion[];

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0, field: 'position' })
  declare position: number;

  @Column({ type: DataType.DATE, allowNull: false, field: 'created_at' })
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, field: 'updated_at' })
  declare updatedAt: Date;
}
