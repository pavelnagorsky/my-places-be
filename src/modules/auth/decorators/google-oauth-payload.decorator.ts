import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

type RequestWithGoogleOauthPayload = Request & {
  user?: any;
};

export const GoogleOAuthPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    console.log("dynamic guard");
    const request = ctx
      .switchToHttp()
      .getRequest<RequestWithGoogleOauthPayload>();
    if (!request.user)
      throw new UnauthorizedException({ message: "No token payload found" });
    return request.user;
  }
);
