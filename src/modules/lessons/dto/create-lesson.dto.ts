import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsUrl,
} from 'class-validator';

export class CreateLessonDto {
  @IsUUID()
  courseId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsInt()
  @Min(0)
  position: number;
}
