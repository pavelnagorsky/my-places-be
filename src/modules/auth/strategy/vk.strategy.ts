import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import {
  IFrontendConfig,
  IGoogleCloudConfig,
  IVKConfig,
} from "../../../config/configuration";
import { Strategy } from "passport-custom";
import { plainToInstance } from "class-transformer";
import { validate as validateDto } from "class-validator";
import { OAuthResponseDto } from "../dto/oauth-response.dto";
import { OauthProviderTypesEnum } from "../enums/oauth-provider-types.enum";
import { HttpService } from "@nestjs/axios";
import { VkOauthRequestDto } from "../dto/vk-oauth-request.dto";
import { firstValueFrom } from "rxjs";
import {
  IVkOAuthTokensResponse,
  IVkUserResponse,
} from "../interfaces/interfaces";

@Injectable()
export class VkOauthStrategy extends PassportStrategy(Strategy, "vk-oauth") {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService
  ) {
    super();
  }

  async validate(req: Request): Promise<OAuthResponseDto> {
    try {
      // 1. Convert and validate request body
      const dto = plainToInstance(VkOauthRequestDto, req.body);
      const errors = await validateDto(dto);
      if (errors.length > 0) {
        throw new BadRequestException();
      }

      // 2. Exchange code for tokens
      const tokensResponse = await firstValueFrom(
        this.httpService.post<IVkOAuthTokensResponse>(
          `https://id.vk.com/oauth2/auth`,
          {
            grant_type: "authorization_code",
            code: dto.authCode,
            client_id: this.config.get<IVKConfig>("vk")?.clientId,
            device_id: dto.deviceId,
            state: dto.state,
            code_verifier: this.config.get<IVKConfig>("vk")?.codeVerifier,
            redirect_uri: `https://${
              this.config.get<IFrontendConfig>("frontend")?.domain
            }/auth/oauth/vk`,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
      );
      if (tokensResponse.data.error)
        throw new BadRequestException({
          message: tokensResponse.data.error_description,
        });

      // 3. Fetch profile
      const profileResponse = await firstValueFrom(
        this.httpService.get<IVkUserResponse[]>(
          `https://api.vk.com/method/users.get`,
          {
            params: {
              user_ids: tokensResponse.data.user_id,
              fields: "first_name,last_name,email",
              access_token: tokensResponse.data.access_token,
              v: "5.199",
            },
          }
        )
      );
      if (!profileResponse.data?.length || !profileResponse.data[0]?.email)
        throw new BadRequestException({
          message: `No user or no user email`,
        });
      const user = profileResponse.data[0];

      return new OAuthResponseDto({
        providerId: `${tokensResponse.data.user_id}`,
        providerType: OauthProviderTypesEnum.VK,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        accessToken: tokensResponse.data.access_token,
        refreshToken: tokensResponse.data.refresh_token,
      });
    } catch (error) {
      console.log("vk oauth strategy error", error?.message);
      throw new UnauthorizedException({
        message: error?.message ?? "Invalid authorization code",
      });
    }
  }
}
