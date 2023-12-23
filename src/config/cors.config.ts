import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig: CorsOptions = {
  origin: '*',
  allowedHeaders: '*',
  methods: '*',
  optionsSuccessStatus: 200,
  credentials: true,
};
