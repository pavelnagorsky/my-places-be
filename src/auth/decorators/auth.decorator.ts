import {
  applyDecorators,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Roles } from '../../modules/roles/decorators/roles.decorator';
import { RoleNamesEnum } from '../../modules/roles/enums/role-names.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/roles/guards/RolesGuard';

export function Auth(...roles: RoleNamesEnum[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedException,
    }),
  );
}
