import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from '../../../config/configuration';
import { AccessTokenPayloadDto } from '../dto/access-token-payload.dto';

@Injectable()
export class JwtResetPasswordStrategy extends PassportStrategy(
  Strategy,
  'reset-password-jwt',
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<IJwtConfig>('jwt')?.resetPasswordTokenSecret,
      // passReqToCallback: 'tokenPayload',
    });
  }

  async validate(payload: AccessTokenPayloadDto) {
    return payload;
  }
}
