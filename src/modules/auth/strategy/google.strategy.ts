import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { IGoogleCloudConfig } from "../../../config/configuration";
import { Strategy } from "passport-custom";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { GoogleOauthRequestDto } from "../dto/google-oauth-request.dto";
import { plainToInstance } from "class-transformer";
import { validate as validateDto } from "class-validator";
import { OAuthResponseDto } from "../dto/oauth-response.dto";
import { OauthProviderTypesEnum } from "../enums/oauth-provider-types.enum";

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(
  Strategy,
  "google-oauth"
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

      // 2. Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken({
        code: dto.authCode,
        client_id: this.config.get<IGoogleCloudConfig>("googleCloud")?.clientId,
        redirect_uri: "postmessage", // Required for auth-code flow
      });

      // 3. Verify ID token
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: this.config.get<IGoogleCloudConfig>("googleCloud")?.clientId,
      });

      const payload = ticket.getPayload() as TokenPayload;

      return new OAuthResponseDto({
        providerId: payload.sub,
        providerType: OauthProviderTypesEnum.Google,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token, // Only on first login
      });
    } catch (error) {
      console.log("google oauth strategy error", error?.message);
      throw new UnauthorizedException({
        message: error?.message ?? "Invalid authorization code",
      });
    }
  }
}
