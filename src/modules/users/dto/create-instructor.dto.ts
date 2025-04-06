import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class CreateInstructorDto extends CreateUserDto {
  // @IsEmail()
  // email: string;

  // @IsString()
  // @MinLength(6)
  // password: string;

  // @IsString()
  // firstName: string;

  // @IsString()
  // lastName: string;

  @IsString()
  @IsOptional()
  qualifications?: string;

  @IsString()
  @IsOptional()
  experience?: string;

  @ApiProperty({
    description: 'Instructor role (automatically set to "instructor")',
    example: 'instructor',
    default: 'instructor',
  })
  role: string = 'instructor';

  @ApiProperty({
    description: 'Instructor status (automatically set to "pending")',
    example: 'pending',
    default: 'pending',
  })
  instructorStatus: string = 'pending';
}
