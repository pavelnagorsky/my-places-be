import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import { GoogleOneTapGuard } from "./google-one-tap.guard";
import { GoogleOAuthGuard } from "./google-oauth.guard";
import { firstValueFrom, Observable } from "rxjs";
import { GoogleOauthTypesEnum } from "../enums/google-oauth-types.enum";

export class GoogleDynamicAuthGuard implements CanActivate {
  private googleOAuthGuard = new GoogleOAuthGuard();
  private googleOneTapGuard = new GoogleOneTapGuard();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const authType = req.body.type;

    if (authType === GoogleOauthTypesEnum.ONE_TAP) {
      const result = this.googleOneTapGuard.canActivate(context);
      if (result instanceof Observable) {
        return await firstValueFrom(result);
      }
      return result;
    } else if (authType === GoogleOauthTypesEnum.OAUTH) {
      const result = this.googleOAuthGuard.canActivate(context);
      if (result instanceof Observable) {
        return await firstValueFrom(result);
      }
      return result;
    }
    throw new BadRequestException({
      message: "Unknown or missing authentication type",
    });
  }
}
