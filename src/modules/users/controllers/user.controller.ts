import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateStudentDto } from '../dto/create-student.dto';
import { CreateInstructorDto } from '../dto/create-instructor.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { User } from '../entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup/student')
  async signupStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.userService.signupStudent(createStudentDto);
  }

  @Post('signup/instructor')
  async signupInstructor(@Body() createInstructorDto: CreateInstructorDto) {
    return this.userService.signupInstructor(createInstructorDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    await this.userService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  async resendVerification(@Body('userId') userId: string) {
    await this.userService.resendVerificationEmail(userId);
    return { message: 'Verification email sent successfully' };
  }

  @Get('instructors/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPendingInstructors(): Promise<User[]> {
    return this.userService.getPendingInstructors();
  }

  @Post('instructors/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approveInstructor(
    @Param('id') instructorId: string,
    @Body('adminId') adminId: string,
  ) {
    return this.userService.approveInstructor(instructorId, adminId);
  }

  @Post('instructors/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async rejectInstructor(
    @Param('id') instructorId: string,
    @Body('adminId') adminId: string,
  ) {
    return this.userService.rejectInstructor(instructorId, adminId);
  }
}
