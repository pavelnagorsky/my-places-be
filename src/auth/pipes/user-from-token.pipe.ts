import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { TokenPayloadDto } from '../dto/token-payload.dto';

@Injectable()
export class UserFromTokenPipe implements PipeTransform {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async transform(token: string, _metadata: ArgumentMetadata) {
    try {
      const payload = this.jwtService.verify<TokenPayloadDto>(token);

      const user = await this.usersService.findOneById(payload.id);

      if (!user) {
        throw new UnauthorizedException('Invalid users');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid token');
    }
  }
}
