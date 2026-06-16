import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject, Logger } from "@nestjs/common";
import appConfig from "../../config/app.config";
import type { ConfigType } from "@nestjs/config";
import { Environment } from "../enums/environment.enum";
import {Request, Response} from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter{
    private readonly logger = new Logger(HttpExceptionFilter.name)

    constructor(
        @Inject(appConfig.KEY)
        private readonly appConfiguration: ConfigType<typeof appConfig>,
    ){}

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();

        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        
        const isProduction = this.appConfiguration.nodeEnv === Environment.PRODUCTION;
        
        let status = HttpStatus.INTERNAL_SERVER_ERROR;

        let message: string | string[] = 'Internal Server Error';

        let error = 'Internal Server Error';

        if(exception instanceof HttpException){
            status = exception.getStatus();

            const exceptionResponse = exception.getResponse();

            if(typeof exceptionResponse === 'object'){
                const responseObject = exceptionResponse as 
                { 
                    message?: string | string[], 
                    error?: string
                };

                message = responseObject.message ?? exception.message;

                error = responseObject.error ?? exception.name;
            }else {
                message = String(exceptionResponse);
                error = exception.name;
            };
        }else if (exception instanceof Error) {
            message = isProduction
                ? 'Internal Server Error'
                : exception.message;

            error = exception.name;
        };

        if(isProduction && status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            message = 'Internal Server Error';
        };

        const errorResponse: Record<string, unknown> = {
            success: false,
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.originalUrl
        };

        if(!isProduction)
            errorResponse.error = error;

        if(!isProduction && exception instanceof Error){
            errorResponse.stack = exception.stack;
        };
        
        const requestInfo = {
            requestId: request.requestId,
            method: request.method,
            path: request.originalUrl,
            ip: request.ip,
        };

        if(exception instanceof Error){
            this.logger.error(exception.message, JSON.stringify(requestInfo) + '\n' + exception.stack);
        }else{
            this.logger.error(JSON.stringify(requestInfo) );
        };

        response.status(status).json(errorResponse);
    };
};