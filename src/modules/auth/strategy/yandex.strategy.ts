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
  IYandexCloudConfig,
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
  IYandexOAuthTokensResponse,
  IYandexUserResponse,
} from "../interfaces/interfaces";
import { YandexOauthRequestDto } from "../dto/yandex-oauth-request.dto";

@Injectable()
export class YandexOauthStrategy extends PassportStrategy(
  Strategy,
  "yandex-oauth"
) {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService
  ) {
    super();
  }

  // Notice: API requests won't work in local environment. To be called only from https + domain
  async validate(req: Request): Promise<OAuthResponseDto> {
    try {
      // 1. Convert and validate request body
      const dto = plainToInstance(YandexOauthRequestDto, req.body);
      const errors = await validateDto(dto);
      if (errors.length > 0) {
        throw new BadRequestException();
      }

      // 2. Exchange code for tokens
      const clientId =
        this.config.get<IYandexCloudConfig>("yandexCloud")?.clientId;
      const clientSecret =
        this.config.get<IYandexCloudConfig>("yandexCloud")?.clientSecret;
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      );
      const tokensResponse = await firstValueFrom(
        this.httpService.post<IYandexOAuthTokensResponse>(
          `https://oauth.yandex.ru/token`,
          new URLSearchParams({
            grant_type: "authorization_code",
            code: dto.authCode,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${authHeader}`,
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
        this.httpService.get<IYandexUserResponse>(
          `https://login.yandex.ru/info`,
          {
            headers: {
              Authorization: `OAuth ${tokensResponse.data.access_token}`,
            },
          }
        )
      );

      if (!profileResponse.data)
        throw new BadRequestException({
          message: `No user or no user email`,
        });
      const user = profileResponse.data;

      return new OAuthResponseDto({
        providerId: `${user.id}`,
        providerType: OauthProviderTypesEnum.Yandex,
        email: user.default_email,
        firstName: user.first_name,
        lastName: user.last_name,
        accessToken: tokensResponse.data.access_token,
        refreshToken: tokensResponse.data.refresh_token,
      });
    } catch (error) {
      console.log(
        "yandex oauth strategy error",
        error?.message,
        error?.response?.data
      );
      throw new UnauthorizedException({
        message: error?.message ?? "Invalid authorization code",
      });
    }
  }
}
