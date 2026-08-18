import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { AccountType } from "../enum/account-type.enum";

export class SignupDTO{
    @ApiProperty({example: 'Cheche Chukwu', description: 'user fullname'})
    @IsString()
    fullName!: string;

    @ApiProperty({
        example: 'johndoe@example.com',
        description: 'User email address',
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @ApiProperty({
        example: 'StrongPass123!',
        description: 'User password. Must be at least 8 characters long',
        minLength: 8,
    })

    @ApiProperty({
        example: '+2348012345678',
        description: 'User phone number in Nigeria format',
    })
    @IsString()
    @Matches(/^\+[1-9]\d{7,14}$/)
    @IsNotEmpty({ message: 'Phone number is required' })
    phoneNumber!: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    password!: string;

    @ApiProperty({
        enum: AccountType,
        example: AccountType.REGULAR_USER,
        description: 'Account type the user is registering as',
    })
    @IsEnum(AccountType, {
        message: 'Account must be either regular user or organiser',
    })
    accountType!: AccountType;
};