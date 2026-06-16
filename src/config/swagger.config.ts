import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import{ DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

export function setupSwagger(app: INestApplication):void{
    // const isProduction = configService.get('NODE_ENV') === 'production';

    // if(isProduction)
    //     return;

    const config = new DocumentBuilder()
    .setTitle('The Yard Ticket API')
    .setDescription('Ticketing Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document);
};