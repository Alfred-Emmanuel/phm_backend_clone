import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Course } from '../entities/course.entity';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  async findAll(): Promise<Course[]> {
    return this.courseService.findAll();
  }

  @Get('instructor/:id')
  async findByInstructor(@Param('id') instructorId: string): Promise<Course[]> {
    return this.courseService.findByInstructor(instructorId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: Partial<CreateCourseDto>,
  ): Promise<Course> {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async remove(@Param('id') id: string): Promise<void> {
    return this.courseService.remove(id);
  }
}
