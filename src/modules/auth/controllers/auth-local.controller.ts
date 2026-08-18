import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "../services/auth.service";
import { SignupDTO } from "../dto/signup.dto";
import { LoginDto } from "../dto/login.dto";

import { type Request } from "express";
import { VerifyEmailDto } from "../dto/verify-email.dto";
import { VerificationService } from "../services/verification.service";
import { ResendEmailVerificationDto } from "../dto/resend-email-verification.dto";
import { SessionService } from "../services/session.service";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { LogoutDto } from "../dto/logout.dto";
import { PasswordService } from "../services/password.service";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { RequestUser } from "../interfaces/request-user.interface";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@ApiTags('Local authentication')
@Controller('auth')
@Throttle({ default: { ttl: 60000, limit: 5 } })
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly verificationService: VerificationService,
        private readonly sessionService: SessionService,
        private readonly passwordService: PasswordService,
    ) {}

    @Post('signup')
    @ApiOperation({
        summary: 'Signup a new user',
    })
    @ApiResponse({
        status: 201,
        description: 'User sign up request processed successfully',
        schema: {
            example: {
                success: true,
                message: 'Sign up successful',
                data: {
                    user: {
                        email: 'johndoe@example.com',
                    },
                },
            },
        },
    })
    async signup(@Body() signupDto: SignupDTO, ){
        return this.authService.signUp(signupDto);
    };


    @Post('login')
    @ApiOperation({
        summary: 'Login a user',

    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            example: {
                success: true,
                message: 'Login successful',
                data: {
                user: {
                    email: 'johndoe@example.com',
                    isEmailVerified: true,
                },
                auth: {
                    accessToken: 'sample-access-token',
                    refreshToken: 'sample-refresh-token',
                    expiresIn: 'access-token-expiration',
                },
                session: {
                    expiresAt: 'refresh-token-expiration'
                },
                },
            },
        },
    })
    async Login(@Body() loginDto: LoginDto, @Req() req: Request ){
        return this.authService.login(loginDto, req);
    };


    
    @Post('verify-email')
    @ApiOperation({
        summary: 'Verify users email',
        description: 'Verifies a user email using the OTP code'
    })
    @ApiResponse({
        status: 200,
        description: 'Email verified successfully',
        schema: {
            example: {
                success: true,
                message: 'Email verified successfully',
                data: {
                    user: {
                        email: 'johndoe@example.com',
                        isEmailVerified: true,
                        status: 'active',
                    },
                },
            },
        },
    })
    async VerifyEmail(@Body() verifyEmailDto: VerifyEmailDto){
        return this.verificationService.verifyEmail(verifyEmailDto);
    };

    @Post('email-otp-resend')
    @Throttle({ default: { ttl: 60000, limit: 3 } })
    @ApiOperation({
        summary: 'Resend email verification otp',
        description: 'Resends a new email verification otp to an unverified user',
    })
    @ApiResponse({
        status: 200,
        description: 'Email verification otp resent successfully',
        schema: {
            example: {
                success: true,
                message: 'Email verification otp resent successfully',
                data: {
                    emailVerificationOtp: 'sample-email-verification-otp'
                },
            },
        },
    })
    async ResendEmailOtp(@Body() resendEmailOtp: ResendEmailVerificationDto){
        return this.verificationService.resendEmailOtp(resendEmailOtp);
    };

    @Post('forgot-password')
    @Throttle({ default: { ttl: 60000, limit: 3 } })
    @ApiOperation({
        summary: 'Request password reset OTP',
        description: 'Sends a password reset OTP to the user phone number.'
    })
    @ApiResponse({
        status: 200,
        description: 'Password reset OTP request processed successfully',
        schema: {
            example: {
                success: true,
                message: 'Password reset OTP has been sent.',
                data:{
                    passwordResetOtp: '123456',
                }
            },
        },
    })
    async ForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
      return this.passwordService.forgotPassword(forgotPasswordDto);
    };



    @Post('reset-password')
    @ApiOperation({
        summary: 'Reset user password using otp sent to phone number',
    })
    @ApiResponse({
        status: 200,
        description: 'Password reset successful',
        schema: {
            example: {
                success: true,
                message: 'Password reset successful. Please log in again.',
                data: null
            },
        },
    })
    async ResetPassword(@Body() resetPasswordDto: ResetPasswordDto){
        return this.passwordService.resetPassword(resetPasswordDto);
    };



    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('accessToken')
    @ApiOperation({
        summary: 'Change current user password',
        description: 'Allows an authenticated user to change their password using their current password.',
    })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        schema: {
            example: {
                success: true,
                message: 'Password changed successfully. Please log in again.',
                data: null,
            },
        },
    })
    async ChangePassword(@Req() req: Request & {user: RequestUser}, @Body() changePasswordDto: ChangePasswordDto){
        return this.passwordService.changePassword(changePasswordDto, req.user.sub)
    };



    @Post('refresh')
    @ApiOperation({
        summary: 'Refresh access token',
        description: 'Uses a valid refresh token to issue a new access token and refresh token',
    })
    @ApiResponse({
        status: 200,
        description: 'Token refreshed successfully',
        schema: {
            example: {
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    auth: {
                        accessToken: 'new-sample-access-token',
                        refreshToken: 'new-sample-refresh-token',
                        expiresIn: 'refresh-token-expiration',
                    }
                },
            },
        },
    })
    async RefreshToken(@Body() refreshToken: RefreshTokenDto){
        return this.sessionService.refreshToken(refreshToken);
    };

    @Post('logout')
    @ApiOperation({
        summary: 'Logout current session',
        description: 'Logs out user current session.',
    })
    @ApiResponse({
        status: 200,
        description: 'Logout successful',
        schema: {
            example: {
                success: true,
                message: 'Logout successful',
                data: null,
            },
        },
    })
    async logout(@Body() logoutDto: LogoutDto, @Req() req: Request & {user: RequestUser},) {
        return this.sessionService.logout(logoutDto, req.user.sub);
    };
};
