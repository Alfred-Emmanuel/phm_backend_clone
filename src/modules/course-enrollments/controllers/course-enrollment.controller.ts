import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CourseEnrollmentService } from '../services/course-enrollment.service';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CourseEnrollment } from '../entities/course-enrollment.entity';

@Controller('enrollments')
export class CourseEnrollmentController {
  constructor(private readonly enrollmentService: CourseEnrollmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<CourseEnrollment> {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(): Promise<CourseEnrollment[]> {
    return this.enrollmentService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<CourseEnrollment> {
    return this.enrollmentService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<void> {
    return this.enrollmentService.remove(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<CourseEnrollment[]> {
    return this.enrollmentService.findByUser(userId);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  async findByCourse(
    @Param('courseId') courseId: string,
  ): Promise<CourseEnrollment[]> {
    return this.enrollmentService.findByCourse(courseId);
  }
}
