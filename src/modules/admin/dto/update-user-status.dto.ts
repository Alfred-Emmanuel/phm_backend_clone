import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_EMAIL_VERIFICATION = 'pending_email_verification',
}

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'The new status for the user',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
} 