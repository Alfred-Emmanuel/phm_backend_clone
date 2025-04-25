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
import { AssignmentService } from '../services/assignment.service';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Assignment } from '../entities/assignment.entity';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async create(
    @Body() createAssignmentDto: CreateAssignmentDto,
  ): Promise<Assignment> {
    return this.assignmentService.create(createAssignmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Assignment[]> {
    return this.assignmentService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Assignment> {
    return this.assignmentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateAssignmentDto: Partial<CreateAssignmentDto>,
  ): Promise<Assignment> {
    return this.assignmentService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.assignmentService.remove(id);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  async findByCourse(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
  ): Promise<Assignment[]> {
    return this.assignmentService.findByCourse(courseId);
  }
}
