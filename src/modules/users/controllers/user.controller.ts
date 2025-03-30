import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
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
}
