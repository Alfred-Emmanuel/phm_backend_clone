import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Quiz } from './quiz.entity';

@Table({ tableName: 'quiz_questions', timestamps: true })
export class QuizQuestion extends Model<QuizQuestion> {
  @ForeignKey(() => Quiz)
  @Column({ type: DataType.UUID, allowNull: false, field: 'quiz_id' })
  quizId: string;

  @BelongsTo(() => Quiz)
  quiz: Quiz;

  @Column({ type: DataType.TEXT, allowNull: false, field: 'question' })
  question: string;

  @Column({ type: DataType.JSONB, allowNull: false, field: 'options' })
  options: string[]; // e.g. ["A", "B", "C", "D"]

  @Column({ type: DataType.STRING, allowNull: false, field: 'correct_answer' })
  correctAnswer: string;

  @Column({ type: DataType.DATE, allowNull: false, field: 'created_at' })
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, field: 'updated_at' })
  declare updatedAt: Date;
}
