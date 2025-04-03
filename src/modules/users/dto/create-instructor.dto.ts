import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateInstructorDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  qualifications?: string;

  @IsString()
  @IsOptional()
  experience?: string;
}
