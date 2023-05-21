import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { TokenPayloadDto } from '../dto/token-payload.dto';

@Injectable()
export class UserFromTokenPipe implements PipeTransform {
  public constructor(private readonly usersService: UsersService) {}

  async transform(tokenPayload: TokenPayloadDto, _metadata: ArgumentMetadata) {
    try {
      const user = await this.usersService.findOneById(tokenPayload.id);

      if (!user) {
        throw new UnauthorizedException({ message: 'Invalid user' });
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException({ message: 'Invalid token' });
    }
  }
}
