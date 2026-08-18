import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { AccountType } from "../enum/account-type.enum";

export class LoginDto{
    @ApiProperty({
        example: 'johndoe@example.com',
        description: 'Registered user email address',
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @ApiProperty({
        example: 'StrongPass123!',
        description: 'User account password',
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password!: string;

    @ApiProperty({
    enum: AccountType,
    example: AccountType.REGULAR_USER,
    description: 'Account the user is logging in to.',
  })
  @IsEnum(AccountType, {
    message: 'Account type can either be regular_user or organizer',
  })
  accountType!: AccountType;
};