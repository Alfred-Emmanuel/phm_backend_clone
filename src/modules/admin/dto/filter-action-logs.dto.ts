import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ActionType {
  UPDATE_USER_STATUS = 'update_user_status',
  UPDATE_USER_ROLE = 'update_user_role',
  APPROVE_INSTRUCTOR = 'approve_instructor',
  REJECT_INSTRUCTOR = 'reject_instructor',
  DELETE_USER = 'delete_user',
  DELETE_ENROLLMENT = 'delete_enrollment',
  DELETE_LESSON = 'delete_lesson',
  UPDATE_LESSON = 'update_lesson',
  DELETE_ASSIGNMENT = 'delete_assignment',
  UPDATE_ASSIGNMENT = 'update_assignment',
  DELETE_COURSE = 'delete_course',
  UPDATE_COURSE = 'update_course',
}

export enum TargetType {
  USER = 'user',
  ENROLLMENT = 'enrollment',
  LESSON = 'lesson',
  ASSIGNMENT = 'assignment',
  COURSE = 'course',
}

export class FilterActionLogsDto {
  @ApiProperty({
    description: 'Filter by action type',
    enum: ActionType,
    required: false,
  })
  @IsEnum(ActionType)
  @IsOptional()
  actionType?: ActionType;

  @ApiProperty({
    description: 'Filter by target type',
    enum: TargetType,
    required: false,
  })
  @IsEnum(TargetType)
  @IsOptional()
  targetType?: TargetType;

  @ApiProperty({
    description: 'Filter by target ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  targetId?: string;

  @ApiProperty({
    description: 'Filter by admin user ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  adminUserId?: string;

  @ApiProperty({
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
} 