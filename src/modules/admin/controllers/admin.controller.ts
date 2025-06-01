import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Delete,
  Query,
  Request,
  ParseUUIDPipe
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { SuperAdminGuard } from '../../../shared/guards/super-admin.guard';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { User } from '../../users/entities/user.entity';
import { AdminActionLog } from '../entities/admin-action-log.entity';
import { CourseEnrollment } from '../../course-enrollments/entities/course-enrollment.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiBody
} from '@nestjs/swagger';
import { RequestWithUser } from '../../../shared/interfaces/request.interface';
import { FilterUsersDto } from '../dto/filter-users.dto';
import { FilterActionLogsDto } from '../dto/filter-action-logs.dto';
import { PaginatedActionLogsDto } from '../dto/paginated-action-logs.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users with optional filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of users, optionally filtered by role and status',
    type: [User],
  })
  async findAllUsers(@Query() filterDto?: FilterUsersDto): Promise<User[]> {
    return this.adminService.findAllUsers(filterDto);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get a specific user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: User,
  })
  async findOneUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
    return this.adminService.findOneUser(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<User> {
    return this.adminService.updateUserStatus(id, updateUserStatusDto, req.user.userId);
  }

  @Patch('users/:id/role')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Update user role (Super Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only super admins can update user roles',
  })
  async updateUserRole(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Req() req: RequestWithUser,
  ): Promise<User> {
    return this.adminService.updateUserRole(id, updateUserRoleDto, req.user.userId);
  }

  @Get('action-logs')
  @ApiOperation({ summary: 'Get paginated admin action logs with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of admin action logs',
    type: PaginatedActionLogsDto,
  })
  async getActionLogs(@Query() filterDto: FilterActionLogsDto): Promise<PaginatedActionLogsDto> {
    return this.adminService.getActionLogs(filterDto);
  }

  @Post('instructors/:id/approve')
  @ApiOperation({ summary: 'Approve an instructor' })
  @ApiParam({
    name: 'id',
    description: 'Instructor ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructor approved successfully',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Instructor not found or already approved',
  })
  async approveInstructor(
    @Param('id', new ParseUUIDPipe()) instructorId: string,
    @Req() req: RequestWithUser,
  ): Promise<User> {
    return this.adminService.approveInstructor(instructorId, req.user.userId);
  }

  @Post('instructors/:id/reject')
  @ApiOperation({ summary: 'Reject an instructor' })
  @ApiParam({
    name: 'id',
    description: 'Instructor ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Instructor rejected successfully',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Instructor not found or already rejected',
  })
  async rejectInstructor(
    @Param('id', new ParseUUIDPipe()) instructorId: string,
    @Req() req: RequestWithUser,
  ): Promise<User> {
    return this.adminService.rejectInstructor(instructorId, req.user.userId);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
  })
  async deleteUser(
    @Param('id', new ParseUUIDPipe()) userId: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    return this.adminService.deleteUser(userId, req.user.userId);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Get all course enrollments' })
  @ApiResponse({
    status: 200,
    description: 'List of all course enrollments',
    type: [CourseEnrollment],
  })
  async getAllEnrollments(): Promise<CourseEnrollment[]> {
    return this.adminService.getAllEnrollments();
  }

  @Delete('enrollments/:id')
  @ApiOperation({ summary: 'Delete a course enrollment' })
  @ApiParam({
    name: 'id',
    description: 'Enrollment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Enrollment not found',
  })
  async deleteEnrollment(
    @Param('id', new ParseUUIDPipe()) enrollmentId: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    return this.adminService.deleteEnrollment(enrollmentId, req.user.userId);
  }

  @Post(':id/admin-reset-password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Admin reset user's password",
    description:
      'Allows an admin to directly reset a user password without email or token. Requires JWT authentication and admin role.',
  })
  @ApiResponse({ status: 200, description: 'Password reset successful.' })
  @ApiResponse({ status: 400, description: 'User not found or bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiBody({ schema: { type: 'object', properties: { newPassword: { type: 'string', minLength: 6 } } } })
  async adminResetUserPassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('newPassword') newPassword: string,
    @Request() req: any,
  ) {
    await this.adminService.adminResetUserPassword(req.user.userId, id, newPassword);
    return { message: 'Password reset successful.' };
  }
} 