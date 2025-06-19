import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAnswer } from './entities/quiz-answer.entity';
import { QuizService } from './services/quiz.service';
import { QuizController } from './controllers/quiz.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Quiz, QuizQuestion, QuizAttempt, QuizAnswer]),
  ],
  providers: [QuizService],
  controllers: [QuizController],
  exports: [QuizService],
})
export class QuizzesModule {}
