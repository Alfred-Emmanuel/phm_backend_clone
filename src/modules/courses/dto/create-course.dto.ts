import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  instructorId: string;
}
