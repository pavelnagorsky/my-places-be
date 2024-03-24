import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities/role.entity';
import { RoleNamesEnum } from '../enums/role-names.enum';

export class RoleDto {
  @ApiProperty({ title: 'Role id' })
  id: number;

  @ApiProperty({ title: 'Role name' })
  name: RoleNamesEnum;

  constructor(partial: Partial<Role>) {
    Object.assign(this, partial);
  }
}
