import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { RequestWithTokenPayload } from '../../shared/types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  protected logger = new Logger('JWT-Guard');

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithTokenPayload>();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader?.split(' ')[0];
      const token = authHeader?.split(' ')[1];
      if (bearer !== 'Bearer' || !token)
        throw new UnauthorizedException({ message: 'No token provided' });
      const tokenPayload = this.jwtService.verify<TokenPayloadDto>(token);
      req.tokenPayload = tokenPayload;
      return true;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
  }
}
