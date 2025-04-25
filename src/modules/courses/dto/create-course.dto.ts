import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export class CreateCourseDto {
  @ApiProperty({
    description: 'The title of the course',
    example: 'Introduction to Pharmacy Management',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'A detailed description of the course',
    example:
      'A comprehensive course covering the basics of pharmacy management systems',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Array of category IDs to associate with the course',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiProperty({
    description: 'A detailed price for the course, denomination is in Naira',
    example:
      '5000',
  })
  @IsNumber()
  @IsOptional()
  price: number;

  @ApiProperty({
    description: 'Is the course free or not',
    example:
      'Yes or No',
  })
  @IsBoolean()
  @IsNotEmpty()
  isFree: boolean;

  @ApiProperty({
    description: 'How long is the course supposed to last',
    example:
      '600',
  })
  @IsString()
  @IsNotEmpty()
  duration: number;

  @ApiProperty({
    description: 'A url link to an image',
    example:
      'img/course-1.png',
  })
  @IsString()
  @IsOptional()
  featuredImage: string;

  @ApiProperty({
    description: 'Level of people the course is for',
    example: 'Beginner',
    enum: CourseLevel
  })
  @IsEnum(CourseLevel)
  @IsOptional()
  level: CourseLevel;

  @ApiProperty({
    description: 'What does the student need to already know before taking this course',
    example:
      'Must understand human anatomy',
  })
  @IsString()
  @IsOptional()
  requirements: string;

  @ApiProperty({
    description: 'What would the user have gained after finishing this course',
    example:
      'Now understands how certain drugs affects the body',
  })
  @IsString()
  @IsNotEmpty()
  learningOutcomes: string;

  @ApiProperty({
    description: 'Who is this course for?',
    example:
      'Fresh graduates',
  })
  @IsString()
  @IsNotEmpty()
  targetAudience: string;

  @ApiProperty({
    description: 'Is this a publish or a draft',
    example: 'draft',
    enum: CourseStatus
  })
  @IsEnum(CourseStatus)
  @IsNotEmpty()
  status: CourseStatus;

}
