import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from '../../config/configuration';
import { AccessTokenPayloadDto } from '../dto/access-token-payload.dto';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-jwt',
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<IJwtConfig>('jwt')?.accessTokenSecret,
      // passReqToCallback: 'tokenPayload',
    });
  }

  async validate(payload: AccessTokenPayloadDto) {
    return payload;
  }
}
