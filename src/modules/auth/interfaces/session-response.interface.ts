export interface SessionResponse {
    message: string,
    data: {
        auth: {
            accessToken: string,
            refreshToken: string,
            expiresIn: string,
        }
    };
};