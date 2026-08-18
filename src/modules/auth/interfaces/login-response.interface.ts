export interface LoginResponse {
  message: string;
  data: {
    user: {
      email: string;
      isEmailVerified: boolean;
    };
    auth: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
    session: {
      expiresAt: Date;
    };
  }
};