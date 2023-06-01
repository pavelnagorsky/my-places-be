import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (typeof token === 'string') return token;
    return null;
  },
);
