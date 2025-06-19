import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { QuizAttempt } from './quiz-attempt.entity';
import { QuizQuestion } from './quiz-question.entity';

@Table({ tableName: 'quiz_answers', timestamps: true })
export class QuizAnswer extends Model<QuizAnswer> {
  @ForeignKey(() => QuizAttempt)
  @Column({ type: DataType.UUID, allowNull: false, field: 'attempt_id' })
  attemptId: string;

  @BelongsTo(() => QuizAttempt)
  attempt: QuizAttempt;

  @ForeignKey(() => QuizQuestion)
  @Column({ type: DataType.UUID, allowNull: false, field: 'question_id' })
  questionId: string;

  @BelongsTo(() => QuizQuestion)
  question: QuizQuestion;

  @Column({ type: DataType.STRING, allowNull: false, field: 'answer' })
  answer: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, field: 'is_correct' })
  isCorrect: boolean;

  @Column({ type: DataType.DATE, allowNull: false, field: 'created_at' })
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, field: 'updated_at' })
  declare updatedAt: Date;
}
