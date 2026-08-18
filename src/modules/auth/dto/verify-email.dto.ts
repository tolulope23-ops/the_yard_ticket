import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyEmailDto{
    @ApiProperty({
        example: 'johndoe@example.com',
        description: 'Registered user email address',
    })
    @IsEmail()
    email!: string;
    
    @ApiProperty({
        example: 'Email-verification code',
        description: 'Email verification code sent to the user',
    })
    @IsString()
    @IsNotEmpty({ message: 'Verification token is required' })
    code!: string;
};