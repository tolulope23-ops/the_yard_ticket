import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: '+johndoe@example.com'
  })
  
  @IsString()
  @IsNotEmpty({ message: 'user email is required' })
  email!: string;
};