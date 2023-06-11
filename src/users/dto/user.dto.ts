import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Admin } from '../../entities/admin.entity';
import { RoleDto } from '../../roles/dto/role.dto';
import { User } from '../entities/user.entity';

export class UserDto {
  @ApiProperty({ title: 'User id', type: Number, default: 1 })
  id: number;

  @ApiProperty({ title: 'First Name', type: String, default: 'John' })
  firstName: string;

  @ApiProperty({ title: 'Last Name', type: String, default: 'Doe' })
  lastName: string;

  @ApiProperty({ title: 'Email', type: String, default: 'johndoe@gmail.com' })
  email: string;

  @ApiProperty({ title: 'Is email confirmed', type: Boolean })
  isEmailConfirmed: boolean;

  @Exclude()
  password: string;

  @ApiProperty({ title: 'Created at', type: Date })
  createdAt: Date;

  @Exclude()
  admin: Admin;

  @ApiProperty({ title: 'Roles', type: RoleDto, isArray: true })
  roles: RoleDto[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
