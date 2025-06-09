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

  @IsOptional()
  @ApiProperty({
    description: 'The embed link of the video',
    example: '<iframe width="560" height="315" src="https://www.youtube.com/embed/4U7xrr_tJTs?si=R0AWuYbCtQhWq42L" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
  })
  // @IsUrl()
  @IsString()
  @IsOptional()
  videoUrl?: string;

  // @IsOptional()
  // @ApiProperty({
  //   description: 'The Cloudinary public ID of the uploaded video',
  //   example: 'phm/course_images/abc123xyz',
  // })
  @IsString()
  videoPublicId?: string;

  @IsInt()
  @Min(0)
  position: number;
}
