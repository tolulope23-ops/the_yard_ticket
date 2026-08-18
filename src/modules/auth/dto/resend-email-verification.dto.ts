import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendEmailVerificationDto {
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Registered user email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;
};