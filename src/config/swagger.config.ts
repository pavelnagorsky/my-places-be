import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('My-Places API')
  .setDescription('The My-Places API description')
  .setVersion('1.0')
  .addBearerAuth(
    {
      description: 'Please enter token in following format: Bearer <JWT>',
      name: 'Authorization',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    },
    'access-token',
  )
  .build();
