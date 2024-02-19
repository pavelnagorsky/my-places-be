import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig: CorsOptions = {
  origin: ['http://localhost:3001', 'https://my-places.by'],
  allowedHeaders: [
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type',
    'Authorization',
    'Access-Control-Allow-Credentials',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  optionsSuccessStatus: 200,
  credentials: true,
};
