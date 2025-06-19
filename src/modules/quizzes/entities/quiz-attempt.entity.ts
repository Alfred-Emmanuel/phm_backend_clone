import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Quiz } from './quiz.entity';
import { User } from '../../users/entities/user.entity';

@Table({ tableName: 'quiz_attempts', timestamps: true })
export class QuizAttempt extends Model<QuizAttempt> {
  @ForeignKey(() => Quiz)
  @Column({ type: DataType.UUID, allowNull: false, field: 'quiz_id' })
  quizId: string;

  @BelongsTo(() => Quiz)
  quiz: Quiz;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false, field: 'user_id' })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.INTEGER, allowNull: false, field: 'score' })
  score: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, field: 'passed' })
  passed: boolean;

  @Column({ type: DataType.DATE, allowNull: false, field: 'created_at' })
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, field: 'updated_at' })
  declare updatedAt: Date;
}
