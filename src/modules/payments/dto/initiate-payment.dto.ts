import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID (UUID)' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: '987e6543-e21c-65d4-b789-123456789abc', description: 'Course ID (UUID)' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ example: 5000, description: 'Amount to pay in kobo (for NGN)' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
