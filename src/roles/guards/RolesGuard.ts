import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithTokenPayload } from '../../shared/types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleNamesEnum } from '../enums/role-names.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  protected logger = new Logger('Roles-Guard');

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithTokenPayload>();
    try {
      const requiredRoles = this.reflector.getAllAndOverride<RoleNamesEnum[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      const tokenPayload = req?.user;
      if (!tokenPayload)
        throw new UnauthorizedException({ message: 'No token provided' });
      if (!requiredRoles || requiredRoles?.length === 0) return true;

      this.logger.warn(requiredRoles);
      const access = tokenPayload.roles?.some((role) =>
        requiredRoles.includes(role?.name),
      );
      this.logger.warn(`Access: ${access}`);
      return access;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
  }
}
