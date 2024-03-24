import { SetMetadata } from '@nestjs/common';
import { RoleNamesEnum } from '../enums/role-names.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RoleNamesEnum[]) =>
  SetMetadata(ROLES_KEY, roles);
