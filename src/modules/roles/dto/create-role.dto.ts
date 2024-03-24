import { ApiProperty } from '@nestjs/swagger';
import { RoleNamesEnum } from '../enums/role-names.enum';

export class CreateRoleDto {
  @ApiProperty({
    title: 'Role name',
    default: RoleNamesEnum.USER,
    enum: RoleNamesEnum,
  })
  name: RoleNamesEnum;
}
