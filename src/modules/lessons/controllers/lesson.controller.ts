import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from '../services/lesson.service';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Lesson } from '../entities/lesson.entity';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async create(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    return this.lessonService.create(createLessonDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Lesson[]> {
    return this.lessonService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<Lesson> {
    return this.lessonService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: Partial<CreateLessonDto>,
  ): Promise<Lesson> {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async remove(@Param('id') id: string): Promise<void> {
    return this.lessonService.remove(id);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  async findByCourse(@Param('courseId') courseId: string): Promise<Lesson[]> {
    return this.lessonService.findByCourse(courseId);
  }

  @Post('course/:courseId/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async reorderLessons(
    @Param('courseId') courseId: string,
    @Body('lessonIds') lessonIds: string[],
  ): Promise<void> {
    return this.lessonService.reorderLessons(courseId, lessonIds);
  }
}
