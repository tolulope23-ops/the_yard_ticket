import { BadRequestException, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { PasswordService } from "./password.service";
import { User } from "../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { SignupDTO } from "../dto/signup.dto";
import { VerificationService } from "./verification.service";
import { LoginDto } from "../dto/login.dto";
import { ConfigService, ConfigType } from "@nestjs/config";
import { jwtConfig } from "@/config";
import { TokenService } from "./token.service";
import { Request } from "express";
import { LoginResponse } from "../interfaces/login-response.interface";
import { deriveDeviceName, extractIpAddress } from "../utils/session-device.utils";
import { Session } from "../entities/session.entity";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { VerificationRequiredException } from "./verification-required.service";
import { AuthCredential } from "../entities/auth-credentials.entity";
import { AuthProvider } from "../enum/auth-provider.enum";
import { UserAccount } from "../entities/user-account.entity";
import { AccountStatus } from "../enum/account-status.enum";

@Injectable()
export class AuthService{
    constructor(
        private readonly dataSource: DataSource,
        private readonly configService: ConfigService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(AuthCredential)
        private readonly authCredentialRepository: Repository<AuthCredential>,

        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>,

        @InjectRepository(UserAccount)
        private readonly userAccountRepository: Repository<UserAccount>,

        private readonly passwordService: PasswordService,
        private readonly verificationService: VerificationService,
        private readonly tokenService: TokenService,
        private readonly jwtService: JwtService,
    ){}

    /**
     * method to register new user to the platform, send verification to their identifiers
     */
    async signUp(dto: SignupDTO){
        //normalise email and phone trim off spaces and convert email to lowercase
        const normalizedEmail: string = dto.email.trim().toLowerCase();
        const normalizedPhone: string = dto.phoneNumber.trim();

        //hash incoming password
        const hashPassword = await this.passwordService.hash(dto.password);

        //check if user exist
        const userExist = await this.userRepository
        .createQueryBuilder('userExists')
        .where('userExists.email = :email', {email: normalizedEmail})
        .getOne()

        if(userExist){
            const userAccount = await this.userAccountRepository
            .createQueryBuilder('userAccountExists')
            .where('userAccountExists.userId = :userId', {userId: userExist.id})
            .andWhere('userAccountExists.accountType = :accountType', {accountType: dto.accountType})
            .getOne()

            if(userAccount){
                throw new BadRequestException('Already have an account');
            };

            //save existing user with a new account type to db.
            await this.dataSource.transaction(async manager => {
                const account = manager.create(UserAccount, {
                    userId: userExist.id,
                    accountType: dto.accountType,
                });

                const savedAccount = await manager.save(account);

                const credential = manager.create(AuthCredential, {
                    accountId: savedAccount.id,
                    provider: AuthProvider.LOCAL,
                    identifier: normalizedEmail,
                    passwordHash: hashPassword,
                });

                await manager.save(credential);
            });

            return {
                message: 'User account created successfully',
                data: {
                    user: {
                        email: userExist.email,
                    },
                },
            };
        };

        //Transaction to create user's record all at once, atomic.
        const createUser = await this.dataSource.transaction(async (manager) => {
            //create user's base record

            const user = manager.create(User, {
                email: normalizedEmail,
                phoneNumber: normalizedPhone
            });

            const savedUser = await manager.save(user);

            const userAccount = manager.create(UserAccount, {
                userId: savedUser.id,
                accountType: dto.accountType,
            });

            const savedUserAccount = await manager.save(userAccount);

            const credential = manager.create(AuthCredential, {
                accountId: savedUserAccount.id,               
                passwordHash: hashPassword,
                provider: AuthProvider.LOCAL,
                identifier: normalizedEmail
            })

            await manager.save(credential);
            
            //return created user data
            return savedUser;
        });

        //send verification details to send to user's email and phone
        const verification = await this.verificationService.createRegistrationVerification(createUser.id);
        

        return {
            message: 'user registered successfully',
            data: {
                user: {
                    email: createUser.email,
                },
                dev: {
                    emailToken: verification.rawEmailCode,
                }
            }
        };
    };

    /**
     * method to signin existing users, and creating a valid accesstoken for users to acess protected routes
     */
    async login(dto: LoginDto, req: Request): Promise<LoginResponse>{
        const normalizedEmail: string = dto.email.trim().toLowerCase();

        //check if email exist
        const userAccountExists = await this.userAccountRepository
        .createQueryBuilder('account')
        .addSelect('account.passwordHash')
        .innerJoinAndSelect('account.user', 'user')
        .where('user.email = :email', { email: normalizedEmail })
        .andWhere('account.accountType = :type', {
            type: dto.accountType,
        })
        .andWhere('account.status = :status', { status: AccountStatus.ACTIVE })
        .getOne();

        if(!userAccountExists){
            throw new BadRequestException('Invalid user');
        };

        if (!userAccountExists.user.isEmailVerified) {
            throw new VerificationRequiredException(userAccountExists.user.isEmailVerified)
        };

        //retrive user's credential
        const credential = await this.authCredentialRepository
        .createQueryBuilder('credential')
        .addSelect(['credential.passwordHash'])
        .where('credential.accountId = :accountId', { accountId: userAccountExists.id})
        .andWhere('credential.identifier = :identifier', { identifier: normalizedEmail })
        .andWhere('credential.provider = :provider', { provider: AuthProvider.LOCAL})
        .andWhere('credential.isActive = :isActive', { isActive: true })
        .getOne();

        if (!credential || !credential.passwordHash) {
            throw new BadRequestException('Invalid email or password');
        };

        // Compare incoming password against stored password hash
        const passwordMatches = await this.passwordService.verify(credential.passwordHash, dto.password);

        if (!passwordMatches) {
            throw new BadRequestException('Invalid email or password');
        };

        // //create user's accesstoken upon login to access protected routes
        const jwtConfiguration = this.configService.get<ConfigType<typeof jwtConfig>>(jwtConfig.KEY);

        const accessTokenExpiresIn = jwtConfiguration?.accessToken_expiresIn ?? '1d';
        const refreshExpiresInDays = jwtConfiguration?.refreshToken_expiresIn ?? 30;

        //generate new refresh token for refresh token rotation
        const {rawToken, hashedToken} = this.tokenService.generateToken();

        //initialise new raw and hash refresh token
        const newRefreshtoken = rawToken;
        const newRefreshtokenHash = hashedToken;

        //create expiration for new refresh token generated
        const refreshTokenExpiresIn = new Date( Date.now() + Number(refreshExpiresInDays) * 24 * 60 * 60 * 1000);

        //extract metadata from user's request for session data
        const userAgentHeader = req.headers['user-agent'];
        const userAgent = typeof userAgentHeader === 'string' ? userAgentHeader : undefined;
        
        const ipAddress = extractIpAddress(req);
        const deviceName = deriveDeviceName(userAgent) ?? undefined;

        //create user's session data in the db along with refreshToken
        const session = this.sessionRepository.create({
            accountId: userAccountExists.id,
            refreshTokenHash: newRefreshtokenHash,
            deviceName,
            userAgent,
            ipAddress,
            expiresAt: refreshTokenExpiresIn,
            lastUsedAt: new Date()
        });

        const savedSession = await this.sessionRepository.save(session);

        //create user's accessToken for protected resource
        const accessToken = await this.jwtService.signAsync(
            {
                sub: userAccountExists.id,
                userId: userAccountExists.user.id,
                email: userAccountExists.user.email,
                sessionId: savedSession.id
            },
            {
                expiresIn: accessTokenExpiresIn as JwtSignOptions['expiresIn']
            }
        );

        //update user's last successful login and save to db
        userAccountExists.lastLoginAt = new Date();
        await this.userAccountRepository.save(userAccountExists);

        //update user's recent auth credential and save to db
        credential.lastUsedAt = new Date();
        await this.authCredentialRepository.save(credential);

        return{
            message: 'user logged in successfully',
            data:{
                user:{
                    email: userAccountExists.user.email,
                    isEmailVerified: userAccountExists.user.isEmailVerified,
                },
                auth: {
                    accessToken,
                    refreshToken: newRefreshtoken,
                    expiresIn: accessTokenExpiresIn
                },
                session: {
                    expiresAt: refreshTokenExpiresIn
                }
            }
        };
    };
};