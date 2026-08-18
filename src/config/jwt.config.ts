import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessToken_expiresIn: process.env.ACCESS_JWT_EXPIRES_IN,
  refreshToken_expiresIn: process.env.REFRESH_JWT_EXPIRES_IN
}));