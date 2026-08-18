import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from 'argon2';
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";

import { VerificationToken } from "../entities/verification-token.entity";
import { VerificationTokenType } from "../enum/verification-token-type.enum";
import { TokenService } from "./token.service";
import { addTimeToDate } from "../utils/time.util";

import { ResetPasswordDto } from "../dto/reset-password.dto";
import { ChangePasswordDto } from "../dto/change-password.dto";

import { SessionService } from "./session.service";
import { AuthCredential } from "../entities/auth-credentials.entity";
import { AccountStatus } from "../enum/account-status.enum";
import { UserAccount } from "../entities/user-account.entity";

@Injectable()
export class PasswordService{
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(VerificationToken)
        private readonly verificationRepository: Repository<VerificationToken>,

        @InjectRepository(AuthCredential)
        private readonly authCredentialRepository: Repository<AuthCredential>,

        @InjectRepository(UserAccount)
        private readonly userAccountRepository: Repository<UserAccount>,

        private readonly tokenService: TokenService,
        private readonly sessionService: SessionService,
    ){}
    /**
     * method to hash user's incoming password before storing in the db
     */
    async hash(password: string): Promise<string>{
        return argon2.hash(password);
    };

    /**
     * method to verify user's password when signining in, comparing it with the one stored in the db and the
     * incoming password by using the verify method from argon.
     */
    async verify(hash: string, password: string): Promise<boolean>{
        return argon2.verify(hash, password);
    };

    /**
     * method to orchestrate user forgot password, by sending a new verification to their email to start the process of resetting it. 
     */
    async forgotPassword(dto: ForgotPasswordDto){
        const normalizeEmail = dto.email.trim().toLowerCase();

        const user = await this.userRepository.findOne({
            where: {
                email: normalizeEmail,
                status: AccountStatus.ACTIVE
            }
        });

        if(!user) {
            throw new BadRequestException('Invalid email');
        };

        // check for existing otps sent to user's email for forgot password and mark them as used
        const existingOtps = await this.verificationRepository.find({
            where: {
                userId: user.id,
                type: VerificationTokenType.PASSWORD_RESET,
            },
            order: {createdAt: 'DESC'}
        });

        const now = new Date();

        if (existingOtps && existingOtps.length > 0) {
            for (const otp of existingOtps) {
                if (!otp.usedAt && otp.expiresAt > now) {
                    otp.usedAt = now;
                };
            };

            await this.verificationRepository.save(existingOtps);
        };

        //generate a password rest token to send to user's email
        const { rawCode, hashedCode } = this.tokenService.generateCode(6);
        
        const expiresAt = addTimeToDate(10, 'minutes');

        const passwordResetOtp = this.verificationRepository.create({
            userId: user.id,
            type: VerificationTokenType.PASSWORD_RESET,
            codeHash: hashedCode,
            expiresAt,
        });

        await this.verificationRepository.save(passwordResetOtp);

        return {
            message: 'otp sent sucessfully',
            data: {
                // dev
                passwordResetOtp: rawCode
            }
        };
    };

    /**
     * method to reset user's password by calling the change password to update user new password
     */
    async resetPassword(dto: ResetPasswordDto){
        const normalizeEmail = dto.email.trim().toLowerCase();
        const normalizedOtp = dto.code;

        const account = await this.userAccountRepository
        .createQueryBuilder('account')
        .addSelect('account.passwordHash')
        .innerJoinAndSelect('account.user', 'user')
        .where('user.emai = :email', {
            email: normalizeEmail,
        })
        .andWhere('account.accountType = :type', {
            type: dto.accountType,
        })
        .getOne();

        if(!account){
            throw new BadRequestException('Invalid email');
        };

        // check for existing otps sent to user's email for forgot password and mark them as used
        const existingOtps = await this.verificationRepository.findOne({
            where: {
                userId: account.user.id,
                type: VerificationTokenType.PASSWORD_RESET,
            }
        });

        if (!existingOtps) {
            throw new NotFoundException('Invalid Otp');
        };

        if (existingOtps.usedAt) {
            throw new BadRequestException('Invalid Otp');
        };

        if (existingOtps.expiresAt < new Date()) {
            throw new BadRequestException('Invalid Otp');
        };

        if (existingOtps.attemptsCount! >= 3) {
            throw new BadRequestException('Invalid Otp');
        };

        const codeHash = this.tokenService.hashToken(normalizedOtp);

        if (existingOtps.codeHash !== codeHash) {
            existingOtps.attemptsCount! += 1;
            await this.verificationRepository.save(existingOtps);

            throw new BadRequestException('Invalid OTP');
        };

        // mark OTP as used
        existingOtps.usedAt = new Date();
        await this.verificationRepository.save(existingOtps);

        // update user's password credential revoke user account active sessions
        await this.updateAccountPassword(account.id, dto.newPassword);
        
        return {
            message: 'Password reset successful. Please log in again.',
            data: null
        };
    };

    /**
     * method to update, or reset user's password, calling the db and saving the user new password
     */
    async changePassword(dto: ChangePasswordDto, accountId: string){
        //validate the user's current password is diffeerent from the new one
        if(dto.currentPassword === dto.newPassword){
            throw new BadRequestException('new password must be different from current password');
        };

        const credential = await this.authCredentialRepository.findOne({
            where: {
                accountId: accountId
            },
            select: {passwordHash: true, accountId: true}
        });

        if(!credential){
            throw new BadRequestException('user not found');
        };

        //compare current password sent by user to the one stored in the db.
        const compareMatches = await this.verify(credential.passwordHash!, dto.currentPassword);

        if(!compareMatches){
            throw new ForbiddenException('Invalid password');
        };

        //update user password
        await this.updateAccountPassword(credential.accountId, dto.newPassword);

        return{
            message: 'Password changed successfully. Please log in again.',
            date: null
        };
    };

    private async updateAccountPassword(accountId: string, newPassword: string){
        const credential = await this.authCredentialRepository.findOne({
            where: {
                accountId,
            },
            select: {
                id: true,
                accountId: true,
                passwordHash: true,
            },
        });

        if (!credential) {
            throw new NotFoundException('user not found');
        };

        const hashedPassword = await this.hash(newPassword);

        if(credential.passwordHash === hashedPassword){
            throw new BadRequestException('new password must be different from current password');
        };

        credential.passwordHash = hashedPassword;
        await this.authCredentialRepository.save(credential);

        await this.sessionService.logoutAllAccountSessions(accountId)
    };
};