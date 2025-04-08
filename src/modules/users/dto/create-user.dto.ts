import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsPhoneNumber,
  IsOptional,
} from 'class-validator';
import { GsmNetwork, Profession } from '../entities/user.entity';
import { NigerianStates } from '../../../shared/utils/nigeria-states';

export class CreateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'GSM network provider',
    enum: GsmNetwork,
    example: GsmNetwork.MTN,
  })
  @IsEnum(GsmNetwork)
  gsmNetwork: GsmNetwork;

  @ApiProperty({
    description: 'Phone number',
    example: '+2348012345678',
  })
  @IsPhoneNumber('NG')
  phoneNumber: string;

  @ApiProperty({
    description: 'PCN registration number',
    example: 'PCN12345',
  })
  @IsString()
  pcnNumber: string;

  @ApiProperty({
    description: 'Place of work',
    example: 'General Hospital, Lagos',
  })
  @IsString()
  placeOfWork: string;

  @ApiProperty({
    description: 'State of residence',
    enum: NigerianStates,
    example: NigerianStates.LAGOS,
    required: false,
  })
  @IsEnum(NigerianStates)
  @IsOptional()
  state?: NigerianStates;

  @ApiProperty({
    description: 'Country of residence',
    example: 'Nigeria',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Professional cadre',
    enum: Profession,
    example: Profession.HOSPITAL_PHARMACIST,
  })
  @IsEnum(Profession)
  professionalCadre: Profession;

  @ApiProperty({
    description:
      'Additional information (required if professional cadre is OTHERS)',
    example: 'Research Pharmacist',
    required: false,
  })
  @IsString()
  @IsOptional()
  others?: string;
}
