import * as Joi from 'joi';

export const validationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
    PORT:  Joi.number().default(4000),
    
    DATABASE_URL: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    ACCESS_JWT_EXPIRES_IN: Joi.string().required(),
    REFRESH_JWT_EXPIRES_IN: Joi.number().default(30).required()
});