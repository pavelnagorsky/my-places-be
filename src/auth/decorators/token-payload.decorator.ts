import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithTokenPayload } from '../../shared/types';

export const TokenPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithTokenPayload>();
    if (!request.user)
      throw new UnauthorizedException({ message: 'No token payload found' });
    return request.user;
  },
);
