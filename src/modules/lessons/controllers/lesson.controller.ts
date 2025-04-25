import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { LessonService } from '../services/lesson.service';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Lesson } from '../entities/lesson.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}


  @Post(':courseId')
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({
    status: 201,
    description: 'Lesson created successfully',
    type: Lesson,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiBody({ type: CreateLessonDto })
  @Post(':courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async create(
    @Param('courseId', new ParseUUIDPipe()) courseId: string, 
    @Body() createLessonDto: Omit<CreateLessonDto, 'courseId'>): Promise<Lesson>
  {
    return this.lessonService.create(courseId, {...createLessonDto});
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Lesson[]> {
    return this.lessonService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Lesson> {
    return this.lessonService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a lesson',
    description:
      'Requires JWT authentication, instructor or admin role. Send with Bearer token in Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Update the content of a course',
    type: [Lesson],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an instructor or admin' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateLessonDto: Partial<CreateLessonDto>,
  ): Promise<Lesson> {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.lessonService.remove(id);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  async findByCourse(@Param('courseId', new ParseUUIDPipe()) courseId: string): Promise<Lesson[]> {
    return this.lessonService.findByCourse(courseId);
  }

  @Post('course/:courseId/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async reorderLessons(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Body('lessonIds') lessonIds: string[],
  ): Promise<void> {
    return this.lessonService.reorderLessons(courseId, lessonIds);
  }
}
