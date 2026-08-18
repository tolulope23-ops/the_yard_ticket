import { InjectRepository } from "@nestjs/typeorm";
import { VerificationToken } from "../entities/verification-token.entity";
import { Repository } from "typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { User } from "../entities/user.entity";
import { TokenService } from "./token.service";
import { addTimeToDate } from "../utils/time.util";
import { VerificationTokenType } from "../enum/verification-token-type.enum";
import { ResendEmailVerificationDto } from "../dto/resend-email-verification.dto";
import { VerifyEmailDto } from "../dto/verify-email.dto";
import { AccountStatus } from "../enum/account-status.enum";


@Injectable()
export class VerificationService{
    constructor(
        @InjectRepository(VerificationToken)
        private readonly verificationRepository: Repository<VerificationToken>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly tokenService: TokenService,
    ){}
    /**
     * method to create user verification token to verify both email and phone
     */
    async createRegistrationVerification(userId: string){
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        //check if user exist for verification process
        if(!user){throw new BadRequestException('User not found')};

        //get token and otp code generated from token service
        const { rawCode: rawEmailCode, hashedCode: hashedEmailCode } = this.tokenService.generateCode(6); //for email verification 6 digit code.
        // const { rawCode: rawOtpCode, hashedCode: hashedOtpCode } = this.tokenService.generateCode(4); //for phone verification 4 digit code.

        //initialise token and otp expiration time
        const emailVerificationExpiresAt = addTimeToDate(10, 'minutes');
        // const phoneOtpExpiresAt = addTimeToDate(10, 'minutes');

        //store email verification token to db 
        const emailVerification = this.verificationRepository.create({
            userId: user.id,
            codeHash: hashedEmailCode,
            type: VerificationTokenType.EMAIL_VERIFICATION,
            expiresAt: emailVerificationExpiresAt,
        });

        await this.verificationRepository.save(emailVerification);

        // const phoneVerification = this.verificationRepository.create({
        //     userId: user.id,
        //     codeHash: hashedOtpCode,
        //     expiresAt: phoneOtpExpiresAt,
        // });

        // await this.verificationRepository.save(phoneVerification);

        return { rawEmailCode};
    };

    /**
     * method for resending expired or missed emails for users to verify the email.
     */
    async resendEmailOtp(dto: ResendEmailVerificationDto){
        //normalise user's email for db lookup.
        const normalizedEmail = dto.email.trim().toLowerCase();

        //check if user with that email exsit 
        const user = await this.userRepository.findOne({
            where: { email: normalizedEmail },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        };

        if (user.isEmailVerified) {
            throw new BadRequestException('Email is already verified');
        };

        const { rawCode: rawEmailCode, hashedCode: hashedEmailCode } = this.tokenService.generateCode(6);

        //create email verification expiration time
        const emailVerificationExpiresAt = addTimeToDate(10, 'minutes');

        // invalidate previous active email verification tokens
        const existingVerificationCode = await this.verificationRepository.find({
            where: {
                userId: user.id,
                type: VerificationTokenType.EMAIL_VERIFICATION,
            },
        });

        const now = new Date();

        //check each of the verification code retrieved are used
        for (const code of existingVerificationCode) {
            if (!code.usedAt && code.expiresAt > now) {
                code.usedAt = now;
            };
        };

        if (existingVerificationCode.length > 0) {
            await this.verificationRepository.save(existingVerificationCode);
        };

        //save the new verification token to db.
        const emailVerification = this.verificationRepository.create({
            userId: user.id,
            codeHash: hashedEmailCode,
            type: VerificationTokenType.EMAIL_VERIFICATION,
            expiresAt: emailVerificationExpiresAt,
        });

        await this.verificationRepository.save(emailVerification);

        return {
            message: 'Email verification resent successfully',
            data: {
                email: user.email,
                dev: {
                    emailVerificationOtp: rawEmailCode,
                }
            }
        };
    };

    /**
     * method to verify users email, by hashing the token sent to users and making sure they are valid and the same to with the db. 
     */
    async verifyEmail(dto: VerifyEmailDto){
        //normalise email for verification
        const normalizedEmail = dto.email.trim().toLowerCase();

        //hash email verification code for verification
        const hashRawEmailCode = this.tokenService.hashToken(dto.code);

        const user = await this.userRepository.findOne({
            where: {email: normalizedEmail },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        };

        //check is hashed code is present in the db.
        const latestEmailOtp = await this.verificationRepository
        .createQueryBuilder('emailOtp')
        .addSelect('emailOtp.codeHash')
        .where('emailOtp.userId = :userId', { userId: user.id })
        .andWhere('emailOtp.type = :type', {type: VerificationTokenType.EMAIL_VERIFICATION})
        .andWhere('emailOtp.usedAt IS NULL')
        .andWhere('emailOtp.expiresAt > NOW()')
        .orderBy('emailOtp.createdAt', 'DESC')
        .getOne();

        if (!latestEmailOtp) {
            throw new NotFoundException('Invalid Otp');
        };

        //check if verification code has been used before
        if(latestEmailOtp.usedAt){
            throw new BadRequestException('Otp has already been used');
        };

        //check if email verification code has expired
        if (latestEmailOtp.expiresAt < new Date()) {
            throw new BadRequestException('Invalid Otp');
        };

        if(latestEmailOtp.codeHash !== hashRawEmailCode){
            throw new BadRequestException('Invalid Otp');
        };

        //invalidate email code by initialising used at
        latestEmailOtp.usedAt = new Date();
        await this.verificationRepository.save(latestEmailOtp);

        user.isEmailVerified = true;

        if (user.isEmailVerified /*&& user.isPhoneVerified*/) {
            user.status = AccountStatus.ACTIVE;
        };

        await this.userRepository.save(user);

        return {
            message: 'Email verified successfully',
            data: {
                user: {
                    email: user.email,
                    isEmailVerified: user.isEmailVerified,
                    // isPhoneVerified: user.isPhoneVerified,
                    status: user.status,
                },
            }
        };
    };
};