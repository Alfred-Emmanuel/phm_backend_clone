import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizQuestionDto {
  @ApiProperty({ description: 'Quiz question', example: 'What is 2 + 2?' })
  question: string;

  @ApiProperty({ description: 'Possible options', example: ['2', '3', '4', '5'] })
  options: string[];

  @ApiProperty({ description: 'Correct answer', example: '4' })
  correctAnswer: string;
}

export class CreateQuizDto {
  @ApiProperty({ type: [CreateQuizQuestionDto], description: 'List of quiz questions' })
  questions: CreateQuizQuestionDto[];

  @ApiPropertyOptional({ description: 'Position of the quiz in the course (optional)', example: 3 })
  position?: number;
}
