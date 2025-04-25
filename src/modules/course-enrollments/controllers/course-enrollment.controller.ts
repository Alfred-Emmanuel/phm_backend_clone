import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  ParseUUIDPipe,
  Req
} from '@nestjs/common';
import { CourseEnrollmentService } from '../services/course-enrollment.service';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CourseEnrollment } from '../entities/course-enrollment.entity';
import { RequestWithUser } from 'src/shared/interfaces/request.interface';

@Controller('enrollments')
export class CourseEnrollmentController {
  constructor(private readonly enrollmentService: CourseEnrollmentService) {}

  @Post(":courseId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async create(
    @Param('courseId', new ParseUUIDPipe()) courseId: string, 
    @Body() createEnrollmentDto: Omit<CreateEnrollmentDto, 'courseId'>,
    @Req() req: RequestWithUser,
  ): Promise<CourseEnrollment> {
    const userId = req.user.userId;
    return this.enrollmentService.create({...createEnrollmentDto, courseId, userId});
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<CourseEnrollment> {
    return this.enrollmentService.findOne(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<CourseEnrollment[]> {
    return this.enrollmentService.findByUser(userId);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  async findByCourse(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
  ): Promise<CourseEnrollment[]> {
    return this.enrollmentService.findByCourse(courseId);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: Partial<CreateEnrollmentDto>,
  ) {
    return this.enrollmentService.update(id, updateDto);
  }
}
