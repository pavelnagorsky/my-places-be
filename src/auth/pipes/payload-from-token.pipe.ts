import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PayloadFromTokenPipe implements PipeTransform {
  constructor(private readonly jwtService: JwtService) {}

  async transform(token: string | null, _metadata: ArgumentMetadata) {
    try {
      if (!token) return null;

      const tokenPayload = this.jwtService.verify<TokenPayloadDto>(token);

      return tokenPayload;
    } catch (error) {
      return null;
    }
  }
}
