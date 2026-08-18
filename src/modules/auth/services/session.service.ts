import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "../entities/session.entity";
import { Repository } from "typeorm";
import { TokenService } from "./token.service";
import { ConfigService, ConfigType } from "@nestjs/config";
import { jwtConfig } from "@/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { User } from "../entities/user.entity";
import { SessionResponse } from "../interfaces/session-response.interface";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { LogoutDto } from "../dto/logout.dto";
import { UserAccount } from "../entities/user-account.entity";

@Injectable()
export class SessionService{
    constructor(
        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>,

        @InjectRepository(UserAccount)
        private readonly userAccountRepository: Repository<UserAccount>,

        private readonly tokenService: TokenService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ){}

    /**
     * method to keep user logged in. Rotating users refresh token and creating new accesstoken.
     */
    async refreshToken(dto: RefreshTokenDto): Promise<SessionResponse>{
        
        //hash incoming refresh token before DB lookup.
        const hashToken = this.tokenService.hashToken(dto.refreshToken);

        //find hashed refreshToken from user's session from the db.
        const session = await this.sessionRepository
        .createQueryBuilder('session')
        .addSelect('session.refreshTokenHash')
        .where('session.refreshTokenHash = :refreshTokenHash', {
            refreshTokenHash: hashToken,
        })
        .andWhere('session.isRevoked = :isRevoked', { isRevoked: false })
        .getOne();

        if (!session) {
            throw new UnauthorizedException('Invalid refresh token');
        };

        //check if refresh token or session has expired, if yes throw UnauthorizedException and 
        // redirect the user to login(FE) so as to create a new refreshToken and session
        if (session.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        };

        const account = await this.userAccountRepository.findOne({
            where: { id: session.accountId },
            relations: {
                user: true,
            },
        });

        if (!account) {
            throw new NotFoundException('User not found');
        };

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

        //save the new refresh token generated for token rotation to db(update session refresh token)
        session.refreshTokenHash = newRefreshtokenHash;
        session.expiresAt = refreshTokenExpiresIn;
        session.lastUsedAt = new Date();

        await this.sessionRepository.save(session);

        const accessToken = await this.jwtService.signAsync(
            {
                sub: account.id,
                email: account.user.email,
                sessionId: session.id
            },
            {
                expiresIn: accessTokenExpiresIn as JwtSignOptions['expiresIn']
            }
        );

        return {
            message: 'Token refreshed successfully',
            data: {
                auth: {
                    accessToken,
                    refreshToken: newRefreshtoken,
                    expiresIn: accessTokenExpiresIn
                }
            } 
        };
    };

    /**
     * method to logout user account from an active session
     */
    async logout(dto: LogoutDto, accountId: string) {
        //hash incoming token for logout process
        const hashedToken  = this.tokenService.hashToken(dto.refreshToken);
        
        const session = await this.sessionRepository
        .createQueryBuilder('session')
        .addSelect('session.refreshTokenHash')
        .where('session.refreshTokenHash = :refreshTokenHash', {
            refreshTokenHash: hashedToken,
        })
        .andWhere('session.accountId = :accountId', { accountId })
        .getOne();

        if (!session) {
            throw new NotFoundException('Session not found');
        };

        if (session.isRevoked) {
            throw new BadRequestException('Session is already logged out');
        };

        session.isRevoked = true;
        session.revokedAt = new Date();
        session.lastUsedAt = new Date();

        await this.sessionRepository.save(session);

        return {
            message: 'Logout successful',
            data: null
        };
    };

    /**
     * method to logout user from all their active sessions
     */
    async logoutAllAccountSessions(accountId: string){
        //revoke all sessions tied to that user 
        await this.sessionRepository.update(
            { accountId, isRevoked: false },
            {
                isRevoked: true,
                revokedAt: new Date(),
                lastUsedAt: new Date(),
            },
        );

        return {
            message: 'All active sessions revoked successfully',
            data: null
        };
    };
};
