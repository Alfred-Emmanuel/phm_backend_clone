import { IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  courseId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
