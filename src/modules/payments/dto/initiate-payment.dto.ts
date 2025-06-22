import { IsNotEmpty, IsString, IsNumber, IsArray, ArrayNotEmpty, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID (UUID)' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    type: [String],
    example: ['987e6543-e21c-65d4-b789-123456789abc', '123e4567-e89b-12d3-a456-426614174001'],
    description: 'Array of Course IDs (UUIDs) to enroll in',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  courseIds: string[];

  @ApiProperty({ example: 5000, description: 'Total amount to pay in kobo (for NGN)' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
