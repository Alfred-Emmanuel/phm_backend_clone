import { ApiProperty } from '@nestjs/swagger';

export class QuizAnswerDto {
  @ApiProperty({ description: 'ID of the quiz question', example: 'uuid-question-id' })
  questionId: string;

  @ApiProperty({ description: 'User answer', example: '4' })
  answer: string;
}

export class SubmitQuizDto {
  @ApiProperty({ type: [QuizAnswerDto], description: 'List of answers for the quiz' })
  answers: QuizAnswerDto[];
}
