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
  Req,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Course } from '../entities/course.entity';
import { CategoryType } from '../../categories/entities/category.entity';
import { BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { multerConfig } from 'src/config/multer.config';
import { RequestWithUser } from '../../../shared/interfaces/request.interface';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @UseInterceptors(FileInterceptor('featuredImage', multerConfig))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new course (as instructor)',
    description:
      'Requires JWT authentication with an instructor role. Send with Bearer token in Authorization header. The instructor ID is taken from the token.',
  })
  @ApiBody({
    type: CreateCourseDto,
    examples: {
      example1: {
        summary: 'Create Course Example',
        description: 'Example of creating a new course (instructorId is not needed in body)',
        value: {
          title: 'Introduction to Pharmacy Management',
          description:
            'A comprehensive course covering the basics of pharmacy management systems',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The course has been successfully created.',
    type: Course,
  })
  @ApiResponse({ status: 403, description: 'Forbidden (User role not instructor or instructor not approved).' })
  @ApiResponse({ status: 404, description: 'Instructor not found (Should not happen if token is valid).' })
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Req() req: RequestWithUser,
    @UploadedFile() featuredImage: Express.Multer.File,
  ): Promise<Course> {
    const userId = req.user.userId;
    return this.courseService.create(createCourseDto, userId, featuredImage);
  }

  @Get("/get-courses")
  @ApiOperation({ 
    summary: 'Retrieve all courses',
    description: 'Filter courses by category (slug or ID) and/or type (paid/free/other)'
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category slug or ID',
    example: 'healthcare-management',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by category type',
    enum: CategoryType,
    example: CategoryType.PAID,
  })
  @ApiResponse({
    status: 200,
    description: 'List of courses matching the filter criteria.',
    type: [Course],
  })
  async findAll(
    @Query('category') category?: string,
    @Query('type') type?: CategoryType,
  ): Promise<Course[]> {
    return this.courseService.findAll({ category, type });
  }

  @Get('instructor/:id')
  @ApiOperation({ summary: 'Retrieve all courses by instructor ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'Instructor ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'List of courses by the specified instructor.',
    type: [Course],
  })
  @ApiResponse({ status: 404, description: 'Instructor not found.' })
  async findByInstructor(@Param('id', new ParseUUIDPipe()) instructorId: string): Promise<Course[]> {
    return this.courseService.findByInstructor(instructorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific course by ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'The course details.',
    type: Course,
  })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Course> {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @UseInterceptors(FileInterceptor('featuredImage', multerConfig))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update a course by ID',
    description: 'Requires JWT authentication (instructor or admin). Send with Bearer token. Instructor ID cannot be changed here.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: CreateCourseDto,
    description: 'Partial update of course data (excluding instructorId)',
    examples: {
      example1: {
        summary: 'Update Course Example',
        description: 'Example of updating a course (instructorId is ignored)',
        value: {
          title: 'Updated Course Title',
          description: 'Updated course description',
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'The course has been successfully updated.',
    type: Course,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCourseDto: any, // 👈 Will be parsed from FormData
    @UploadedFile() featuredImage: Express.Multer.File,
    @Req() req: RequestWithUser,
  ): Promise<Course> {
    return this.courseService.update(id, updateCourseDto, req.user.userId, featuredImage);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete a course by ID',
    description: 'Requires JWT authentication (instructor or admin). Send with Bearer token.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Course ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'The course has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithUser
  ): Promise<void> {
    return this.courseService.remove(id);
  }
}
