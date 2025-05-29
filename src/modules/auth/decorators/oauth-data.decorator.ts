import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { OAuthResponseDto } from "../dto/oauth-response.dto";

type RequestWithOAuthPayload = Request & {
  user?: OAuthResponseDto;
};

export const OAuthData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithOAuthPayload>();
    if (!request.user)
      throw new UnauthorizedException({ message: "No OAuth data found" });
    return request.user;
  }
);
