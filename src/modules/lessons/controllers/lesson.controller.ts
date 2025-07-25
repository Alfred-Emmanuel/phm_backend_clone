import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request,
  // UseInterceptors,
  // UploadedFile
} from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { multerConfig } from 'src/config/multer.config';
// import { BadRequestException } from '@nestjs/common';
import { LessonService } from '../services/lesson.service';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Lesson } from '../entities/lesson.entity';
import { UserLesson } from '../entities/user-lesson.entity';
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
  // @UseInterceptors(FileInterceptor('videoUrl', multerConfig))
  async create(
    @Param('courseId', new ParseUUIDPipe()) courseId: string, 
    @Body() createLessonDto: Omit<CreateLessonDto, 'courseId'>,
    // @UploadedFile() videoUrl: Express.Multer.File,
  ): Promise<Lesson>
    
  {
    return this.lessonService.create(courseId, {...createLessonDto});
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Lesson[]> {
    return this.lessonService.findAll();
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
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

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mark a lesson as completed',
    description: 'Marks a lesson as completed for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson marked as completed',
    type: UserLesson,
  })
  async markLessonAsCompleted(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ): Promise<UserLesson> {
    return this.lessonService.markLessonAsCompleted(req.user.userId, id);
  }

  @Post(':id/incomplete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mark a lesson as incomplete',
    description: 'Marks a lesson as incomplete for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson marked as incomplete',
    type: UserLesson,
  })
  async markLessonAsIncomplete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ): Promise<UserLesson> {
    return this.lessonService.markLessonAsIncomplete(req.user.userId, id);
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Toggle lesson bookmark',
    description: 'Toggles the bookmark status of a lesson for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson bookmark status toggled',
    type: UserLesson,
  })
  async toggleBookmark(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ): Promise<UserLesson> {
    return this.lessonService.toggleBookmark(req.user.userId, id);
  }

  @Get('course/:courseId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user progress in a course',
    description: 'Returns the progress of the current user in a specific course',
  })
  @ApiResponse({
    status: 200,
    description: 'User progress retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalLessons: { type: 'number' },
        completedLessons: { type: 'number' },
        progress: { type: 'number' },
        lessons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              position: { type: 'number' },
              completed: { type: 'boolean' },
              isBookmarked: { type: 'boolean' },
              completedAt: { type: 'string', nullable: true },
              startedAt: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getUserLessonProgress(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Request() req: any,
  ) {
    return this.lessonService.getUserLessonProgress(req.user.userId, courseId);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Start a lesson',
    description: 'Marks the start time of a lesson for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson started successfully',
    type: UserLesson,
  })
  async startLesson(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ): Promise<UserLesson> {
    return this.lessonService.startLesson(req.user.userId, id);
  }

  @Get('course/:courseId/grouped')
  @ApiOperation({ summary: 'Get lessons grouped by section title for a course' })
  @ApiResponse({ status: 200, description: 'Lessons grouped by section', type: Object })
  async findByCourseGrouped(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Request() req: any
  ) {
    // Pass user if present, else undefined
    const user = req.user ? req.user : undefined;
    return this.lessonService.findByCourseGrouped(courseId, user);
  }

  @Get('course/:courseId/sections')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all allowed section titles for a course' })
  async getSectionTitles(@Param('courseId', new ParseUUIDPipe()) courseId: string) {
    return this.lessonService.getAllowedSectionTitles(courseId);
  }
}
