import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Session } from "./entities/session.entity";
import { VerificationToken } from "./entities/verification-token.entity";
import { AuthController } from "./controllers/auth-local.controller";
import { AuthService } from "./services/auth.service";

import { PasswordService } from "./services/password.service";
import { VerificationService } from "./services/verification.service";
import { SessionService } from "./services/session.service";
import { TokenService } from "./services/token.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigType } from "@nestjs/config";
import { jwtConfig } from "@/config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthCredential } from "./entities/auth-credentials.entity";
import { UserAccount } from "./entities/user-account.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            UserAccount,
            AuthCredential,
            Session,
            VerificationToken,
        ]),
        
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
            inject: [jwtConfig.KEY],
            useFactory: (
                jwtConfiguration: ConfigType<typeof jwtConfig>) => ({
                secret: jwtConfiguration.secret
            })
        })
    ],
    controllers: [AuthController],
    
    providers: [AuthService, PasswordService, VerificationService, SessionService, TokenService, JwtStrategy],

    exports:[TypeOrmModule, ]
})

export class AuthModule{}
