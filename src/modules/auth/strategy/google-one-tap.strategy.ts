import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { IGoogleCloudConfig } from "../../../config/configuration";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { OAuthResponseDto } from "../dto/oauth-response.dto";
import { plainToInstance } from "class-transformer";
import { GoogleOauthRequestDto } from "../dto/google-oauth-request.dto";
import { validate as validateDto } from "class-validator";
import { OauthProviderTypesEnum } from "../enums/oauth-provider-types.enum";
import { Strategy } from "passport-custom";

@Injectable()
export class GoogleOneTapStrategy extends PassportStrategy(
  Strategy,
  "google-one-tap"
) {
  private oauth2Client: OAuth2Client;

  constructor(private config: ConfigService) {
    super();
    this.oauth2Client = new OAuth2Client(
      config.get<IGoogleCloudConfig>("googleCloud")?.clientId,
      config.get<IGoogleCloudConfig>("googleCloud")?.clientSecret
    );
  }

  async validate(req: Request): Promise<OAuthResponseDto> {
    try {
      // 1. Convert and validate request body
      const dto = plainToInstance(GoogleOauthRequestDto, req.body);
      const errors = await validateDto(dto);
      if (errors.length > 0) {
        throw new BadRequestException();
      }

      // 2. Verify ID token
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: dto.oneTapCode,
        audience: this.config.get<IGoogleCloudConfig>("googleCloud")?.clientId,
      });

      const payload = ticket.getPayload() as TokenPayload;

      return new OAuthResponseDto({
        providerId: `${payload.sub}`,
        providerType: OauthProviderTypesEnum.Google,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        accessToken: null,
        refreshToken: null,
      });
    } catch (error) {
      console.log("google one-tap strategy error", error?.message);
      throw new UnauthorizedException({
        message: error?.message ?? "Invalid authorization code",
      });
    }
  }
}
