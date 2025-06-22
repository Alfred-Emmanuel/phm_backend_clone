import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  ParseUUIDPipe,
  Req,
  HttpException
} from '@nestjs/common';
import { CourseEnrollmentService } from '../services/course-enrollment.service';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CourseEnrollment } from '../entities/course-enrollment.entity';
import { RequestWithUser } from 'src/shared/interfaces/request.interface';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiForbiddenResponse, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class CourseEnrollmentController {
  constructor(private readonly enrollmentService: CourseEnrollmentService) {}

  @Post(":courseId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({ summary: 'Enroll a student in a course' })
  @ApiParam({
    name: 'courseId',
    description: 'UUID of the course to enroll in',
    example: '987e6543-e21c-65d4-b789-123456789abc',
  })
  @ApiResponse({
    status: 201,
    description: 'Student successfully enrolled',
    type: CourseEnrollment,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Student is already enrolled in this course',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiForbiddenResponse({ description: 'Forbidden: Only students can enroll' })
  async create(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Req() req: RequestWithUser,
  ): Promise<any> {
    const userId = req.user.userId;
    try {
      return await this.enrollmentService.create({ courseId, userId });
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 402) {
        // Return payment required response
        return err.getResponse();
      }
      throw err;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a single course enrollment by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the enrollment',
    example: 'f9f0d62c-87d4-4a2c-b68e-12345678abcd',
  })
  @ApiResponse({
    status: 200,
    description: 'The enrollment record',
    type: CourseEnrollment,
  })
  @ApiNotFoundResponse({ description: 'Enrollment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<CourseEnrollment> {
    return this.enrollmentService.findOne(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all enrollments for a user' })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the user',
    example: 'a12f3e4d-5678-9012-b345-67890abcdef1',
  })
  @ApiResponse({
    status: 200,
    description: 'List of enrollments for the user',
    type: [CourseEnrollment],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  async findByUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<CourseEnrollment[]> {
    return this.enrollmentService.findByUser(userId);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all enrollments for a course' })
  @ApiParam({
    name: 'courseId',
    description: 'UUID of the course',
    example: 'b23d4f5e-6789-0123-c456-78901bcdef23',
  })
  @ApiResponse({
    status: 200,
    description: 'List of enrollments for the course',
    type: [CourseEnrollment],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  async findByCourse(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
  ): Promise<CourseEnrollment[]> {
    return this.enrollmentService.findByCourse(courseId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an enrollment record' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the enrollment to update',
    example: 'c34e5f6a-7890-1234-d567-89012cdef345',
  })
  @ApiBody({
    description: 'Fields to update in the enrollment record',
    // type: Partial<CreateEnrollmentDto>,
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment updated successfully',
    type: CourseEnrollment,
  })
  @ApiNotFoundResponse({ description: 'Enrollment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: Partial<CreateEnrollmentDto>,
  ) {
    return this.enrollmentService.update(id, updateDto);
  }
}
