import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({
    description: 'The UUID of the user enrolling in the course',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The UUID of the course the user is enrolling in',
    example: '987e6543-e21c-65d4-b789-123456789abc',
  })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
