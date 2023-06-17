import { Request } from 'express';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';

export type RequestWithTokenPayload = Request & {
  tokenPayload?: TokenPayloadDto;
};
