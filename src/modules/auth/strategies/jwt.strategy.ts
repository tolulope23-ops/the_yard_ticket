import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { type ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { jwtConfig } from '@/config';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestUser } from '../interfaces/request-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    const secret = jwtConfiguration.secret;

    if (!secret) {
      throw new Error('JWT secret is not defined in config');
    };

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  };

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    };

    const session = await this.sessionRepository.findOne({
      where: {
        id: payload.sessionId,
        accountId: payload.sub,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    };

    if (session.isRevoked) {
      throw new UnauthorizedException('Session revoked');
    };

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    };

    return {
      sub: payload.sub,
      userId: payload.userId,
      email: payload.email,
      sessionId: payload.sessionId,
    };
  };
};