import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { exceptionFactory } from './shared/validation/exception-factory';
import { swaggerConfig } from './config/swagger.config';
import { corsConfig } from './config/cors.config';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: corsConfig,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: exceptionFactory,
    }),
  );
  app.use(cookieParser());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env['PORT'] || 3000);
}
bootstrap();
