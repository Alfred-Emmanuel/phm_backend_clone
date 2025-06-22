import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'paystack_ref', description: 'Paystack payment reference' })
  @IsNotEmpty()
  @IsString()
  reference: string;
}
