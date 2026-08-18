import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, IsEnum } from 'class-validator';
import { AccountType } from '../enum/account-type.enum';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'User email',
  })
  @IsString()  
  @IsNotEmpty({ message: 'user email is required' })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP sent to the user email',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User account new password',
  })

  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({
    enum: AccountType,
      example: AccountType.REGULAR_USER,
  })
  @IsEnum(AccountType, {
      message: 'Account type can either be regular user or organizer'
  })
  accountType!: AccountType;

};