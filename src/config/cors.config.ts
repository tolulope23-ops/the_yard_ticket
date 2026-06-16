import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { ConfigService, ConfigType } from "@nestjs/config";
import appConfig from "./app.config";

export const getCorsOptions = (config: ConfigType<typeof appConfig>): CorsOptions => {

    const allowedOrigins = config.allowedOrigin!.split(',').map((o) => o.trim()).filter(Boolean);

    const corsOptions: CorsOptions = {
        origin: (origin, callback) => {
      
            // allow requests with no origin 
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by nestub CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    };
    
    return corsOptions;
};