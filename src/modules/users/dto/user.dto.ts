import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { Moderator } from '../entities/moderator.entity';
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

  @ApiProperty({ title: 'Receive emails', type: Boolean })
  receiveEmails: boolean;

  @Exclude()
  password: string;

  @ApiProperty({ title: 'Preferred language id', type: Number, nullable: true })
  @Transform(({ value }) => {
    return value?.id || null;
  })
  preferredLanguage: number | null;

  @ApiProperty({ title: 'Created at', type: Date })
  createdAt: Date;

  @ApiProperty({ title: 'Updated at', type: Date })
  updatedAt: Date;

  @Exclude()
  blockedUntil: null | Date;

  @Exclude()
  blockReason: null | string;

  @Exclude()
  moderator: Moderator;

  @ApiProperty({ title: 'Roles', type: RoleDto, isArray: true })
  roles: RoleDto[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
