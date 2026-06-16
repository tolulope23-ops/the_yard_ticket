import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { APP_CONSTANTS } from './common/constant/app.constant';
import helmet from 'helmet';
import { ConfigType } from '@nestjs/config';
import { appConfig } from './config';
import { getCorsOptions } from './config/cors.config';
import { validationPipe } from './config/validation.config';
import { setupSwagger } from './config/swagger.config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfiguration = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.setGlobalPrefix(`${APP_CONSTANTS.API_PREFIX}/${APP_CONSTANTS.API_VERSION}`);

  app.use(helmet({
    // crossOriginResourcePolicy: false, //does not allow resources form other origins like images, fileuploads, e.t.c
  }));

  app.enableCors(getCorsOptions(appConfiguration));

  app.useGlobalPipes(validationPipe);

  setupSwagger(app);

  app.enableShutdownHooks();
  await app.listen(appConfiguration.port);

  console.log(`Application running on port ${appConfiguration.port}`,);
};

bootstrap();
