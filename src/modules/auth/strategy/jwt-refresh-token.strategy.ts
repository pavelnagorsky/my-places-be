import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from '../../../config/configuration';
import { Request } from 'express';
import { CookiesEnum } from '../enums/cookies.enum';
import { AccessTokenPayloadDto } from '../dto/access-token-payload.dto';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies[CookiesEnum.REFRESH_TOKEN];
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<IJwtConfig>('jwt')?.refreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: AccessTokenPayloadDto) {
    const refreshToken = req.cookies[CookiesEnum.REFRESH_TOKEN];
    if (!refreshToken) {
      throw new UnauthorizedException({ message: 'No refresh token provided' });
    }
    return {
      ...payload,
      refreshToken,
    };
  }
}
