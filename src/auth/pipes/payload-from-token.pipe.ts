import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PayloadFromTokenPipe implements PipeTransform {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async transform(token: string, _metadata: ArgumentMetadata) {
    try {
      const payload = this.jwtService.verify<TokenPayloadDto>(token);

      return new TokenPayloadDto(payload);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
