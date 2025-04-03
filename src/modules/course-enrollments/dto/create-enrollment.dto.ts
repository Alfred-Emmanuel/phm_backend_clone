import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
