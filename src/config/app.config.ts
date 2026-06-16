import { registerAs } from "@nestjs/config";

export default registerAs('app', () => ({
    nodeEnv: process.env.NODE_ENV,
    port: parseInt(process.env.PORT ?? '4000', 10),
    allowedOrigin: process.env.ALLOWED_ORIGINS
}));