import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from '../../config/configuration';
import { AccessTokenPayloadDto } from '../dto/access-token-payload.dto';

@Injectable()
export class JwtEmailTokenStrategy extends PassportStrategy(
  Strategy,
  'email-jwt',
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<IJwtConfig>('jwt')?.emailTokenSecret,
      // passReqToCallback: 'tokenPayload',
    });
  }

  async validate(payload: AccessTokenPayloadDto) {
    return payload;
  }
}
