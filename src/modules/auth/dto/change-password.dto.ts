import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto{
    @ApiProperty({
        example: 'StrongPass123!',
        description: 'Current account Password',
    })
    @IsString()
    @IsNotEmpty({message: 'Current account password is required'})
    currentPassword!: string;

    @ApiProperty({
        example: 'NewStrongPass123!',
        description: 'New password to replace the current password',
    })
    @IsString()
    @MinLength(8, {message: 'New Password must be at least 8 characters'})
    newPassword!: string;

    @ApiProperty({
        example: 'NewStrongPass123!',
        description: 'Confirm password must be the same as newPassword',
    })
    @IsString()
    @MinLength(8, {message: 'Confirm password must be the same as newPassword'})
    confirmPassword!: string;
};