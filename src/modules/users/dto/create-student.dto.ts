import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class CreateStudentDto extends CreateUserDto {
  // @IsEmail()
  // email: string;

  // @IsString()
  // @MinLength(6)
  // password: string;

  // @IsString()
  // firstName: string;

  // @IsString()
  // lastName: string;

  @ApiProperty({
    description: 'Student role (automatically set to "student")',
    example: 'student',
    default: 'student',
    required: false,
  })
  role?: string = 'student';
}
