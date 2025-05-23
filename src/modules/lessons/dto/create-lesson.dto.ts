import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @IsUUID()
  courseId: string;

  @ApiProperty({
    description: 'Lesson title',
    example: 'Lesson 1',
  })
  @IsString()
  @IsOptional()
  title: string;

  
  @ApiProperty({
    description: 'The content of the lesson',
    example: 'This is where you learn everything you need to know about pharmacy',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsOptional()
  @ApiProperty({
    description: 'The Cloudinary public ID of the uploaded video',
    example: 'phm/course_images/abc123xyz',
  })
  @IsString()
  videoPublicId?: string;

  @IsInt()
  @Min(0)
  position: number;
}
