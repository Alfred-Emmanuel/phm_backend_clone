import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { QuizService } from '../services/quiz.service';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Quizzes')
@ApiBearerAuth('JWT-auth')
@Controller('courses/:courseId/quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Create a new quiz for a course' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiBody({ type: CreateQuizDto })
  @Post()
  async createQuiz(@Param('courseId') courseId: string, @Body() dto: CreateQuizDto) {
    return this.quizService.createQuiz(dto, courseId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get quiz for a course' })
  @ApiResponse({ status: 200, description: 'Quiz retrieved successfully' })
  @Get()
  async getQuiz(@Param('courseId') courseId: string) {
    return this.quizService.getQuizByCourse(courseId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit answers for a quiz' })
  @ApiResponse({ status: 201, description: 'Quiz submitted and result returned' })
  @ApiBody({ type: SubmitQuizDto })
  @Post('submit')
  async submitQuiz(
    @Param('courseId') courseId: string,
    @Body() dto: SubmitQuizDto,
    @Req() req: any // req.user.id should be available if using auth
  ) {
    // Use only req.user.id for user identification
    const userId = req.user?.id;
    if (!userId) throw new Error('User not authenticated');
    return this.quizService.submitQuiz(userId, courseId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get quiz result for the current user' })
  @ApiResponse({ status: 200, description: 'Quiz result retrieved successfully' })
  @Get('result')
  async getQuizResult(
    @Param('courseId') courseId: string,
    @Req() req: any // req.user.id should be available if using auth
  ) {
    const userId = req.user?.id;
    if (!userId) throw new Error('User not authenticated');
    return this.quizService.getQuizResult(userId, courseId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if user can access a quiz at a given position' })
  @ApiResponse({ status: 200, description: 'Returns true if user can access the quiz, false otherwise' })
  @Get('can-access/:position')
  async canAccessQuiz(
    @Param('courseId') courseId: string,
    @Param('position') position: number,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    if (!userId) throw new Error('User not authenticated');
    const canAccess = await this.quizService.canAccessQuiz(userId, courseId, Number(position));
    return { canAccess };
  }
}
