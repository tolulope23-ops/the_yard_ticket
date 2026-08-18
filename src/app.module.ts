import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, type ConfigType } from '@nestjs/config';

import { validationSchema } from './config/env.vlidation';
import { appConfig, databaseConfig, jwtConfig } from './config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ResponseInterceptors } from './common/interceptors/response.interceptors';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from './database/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
       useFactory: (databaseConfiguration: ConfigType<typeof databaseConfig>) => ({
        ...buildTypeOrmOptions(
          databaseConfiguration.url!,
          databaseConfiguration.ssl
        ),
        autoLoadEntities: true,
      })
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:`.env.${process.env.NODE_ENV || 'development'}`,
      load: [appConfig, databaseConfig, jwtConfig],
      validationSchema,
    }),
    
    ThrottlerModule.forRoot([
      {
        ttl: 6000,
        limit: 10,
      }
    ]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {provide: APP_FILTER, useClass: HttpExceptionFilter},
    {provide: APP_INTERCEPTOR, useClass: ResponseInterceptors},
    {provide: APP_GUARD, useClass: ThrottlerGuard},
    AppService
  ],
})
export class AppModule 
  implements NestModule
{
  configure(consumer: MiddlewareConsumer): void {
    consumer
    .apply(RequestIdMiddleware)
    .forRoutes({
      path: '*path',
      method: RequestMethod.ALL
    })
  };
};

