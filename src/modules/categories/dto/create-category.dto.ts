import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Healthcare Management',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The type of category',
    enum: CategoryType,
    example: CategoryType.PAID,
  })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;

  @ApiProperty({
    description: 'A detailed description of the category',
    example: 'Courses related to healthcare management and administration',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'URL-friendly version of the category name',
    example: 'healthcare-management',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;
} 