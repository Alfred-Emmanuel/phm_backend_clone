import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Quiz } from '../entities/quiz.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { QuizAnswer } from '../entities/quiz-answer.entity';
import { CreateQuizDto, CreateQuizQuestionDto } from '../dto/create-quiz.dto';
import { SubmitQuizDto, QuizAnswerDto } from '../dto/submit-quiz.dto';
import { Op } from 'sequelize';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { UserLesson } from '../../lessons/entities/user-lesson.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz) private quizModel: typeof Quiz,
    @InjectModel(QuizQuestion) private quizQuestionModel: typeof QuizQuestion,
    @InjectModel(QuizAttempt) private quizAttemptModel: typeof QuizAttempt,
    @InjectModel(QuizAnswer) private quizAnswerModel: typeof QuizAnswer,
  ) {}

  async createQuiz(dto: CreateQuizDto, courseId: string) {
    // Find the max position among lessons and quizzes for this course
    const lessonMax = await Lesson.max('position', { where: { courseId } });
    const quizMax = await this.quizModel.max('position', { where: { courseId } });
    let position = (dto as any).position;
    // Ensure lessonMax and quizMax are numbers (default to -1 if null/undefined)
    const lessonMaxNum = typeof lessonMax === 'number' ? lessonMax : Number(lessonMax) || -1;
    const quizMaxNum = typeof quizMax === 'number' ? quizMax : Number(quizMax) || -1;
    if (position === undefined || position === null) {
      // Place after the last lesson/quiz
      position = Math.max(Number(lessonMaxNum), Number(quizMaxNum)) + 1;
    } else {
      // Shift quizzes at or after this position
      await this.quizModel.update(
        { position: this.quizModel.sequelize?.literal('position + 1') },
        {
          where: {
            courseId,
            position: { [Op.gte]: position },
          },
        },
      );
    }
    const quiz = await this.quizModel.create({ courseId, position } as any);
    for (const q of dto.questions) {
      await this.quizQuestionModel.create({
        quizId: quiz.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      } as any);
    }
    return quiz;
  }

  async getQuizByCourse(courseId: string) {
    const quiz = await this.quizModel.findOne({
      where: { courseId },
      include: [QuizQuestion],
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async submitQuiz(userId: string, courseId: string, dto: SubmitQuizDto) {
    const quiz = await this.quizModel.findOne({ where: { courseId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    const questions = await this.quizQuestionModel.findAll({ where: { quizId: quiz.id } });
    const questionMap = new Map(questions.map(q => [q.id, q]));
    let correct = 0;
    for (const ans of dto.answers) {
      const q = questionMap.get(ans.questionId);
      if (q && q.correctAnswer === ans.answer) correct++;
    }
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = score >= 50;
    const attempt = await this.quizAttemptModel.create({
      quizId: quiz.id,
      userId,
      score,
      passed,
    } as any);
    for (const ans of dto.answers) {
      const q = questionMap.get(ans.questionId);
      await this.quizAnswerModel.create({
        attemptId: attempt.id,
        questionId: ans.questionId,
        answer: ans.answer,
        isCorrect: !!(q && q.correctAnswer === ans.answer),
      } as any);
    }
    return { score, passed };
  }

  async getQuizResult(userId: string, courseId: string) {
    const quiz = await this.quizModel.findOne({ where: { courseId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    const attempt = await this.quizAttemptModel.findOne({
      where: { quizId: quiz.id, userId },
      order: [['createdAt', 'DESC']],
    });
    if (!attempt) throw new NotFoundException('No attempt found');
    return attempt;
  }

  async canAccessQuiz(userId: string, courseId: string, quizPosition: number) {
    // Get all lessons for the course with position < quizPosition
    const lessons = await Lesson.findAll({
      where: { courseId, position: { [Op.lt]: quizPosition } },
      attributes: ['id'],
    });
    if (!lessons.length) return true; // No lessons before this quiz
    const lessonIds = lessons.map(l => l.id);
    // Get completed lessons for user
    const completed = await UserLesson.count({
      where: { userId, lessonId: { [Op.in]: lessonIds }, completed: true },
    });
    return completed === lessonIds.length;
  }
}
