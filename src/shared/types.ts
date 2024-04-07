import { Request } from 'express';
import { AccessTokenPayloadDto } from '../modules/auth/dto/access-token-payload.dto';

export type RequestWithTokenPayload = Request & {
  user?: AccessTokenPayloadDto;
};
