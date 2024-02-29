import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Moderator } from '../entities/moderator.entity';
import { RoleDto } from '../../roles/dto/role.dto';
import { User } from '../entities/user.entity';
import { Language } from '../../languages/entities/language.entity';

export class UserShortInfoDto {
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

  @ApiProperty({
    title: 'Preferred language code',
    type: String,
    nullable: true,
  })
  @Expose()
  get language(): string | null {
    return this.preferredLanguage?.title || null;
  }

  @Exclude()
  preferredLanguage: Language | null;

  @ApiProperty({ title: 'Created at', type: Date })
  createdAt: Date;

  @ApiProperty({ title: 'Updated at', type: Date })
  updatedAt: Date;

  @ApiProperty({ title: 'Blocked until', type: Date, nullable: true })
  blockedUntil: null | Date;

  @ApiProperty({ title: 'Block reason', type: String, nullable: true })
  blockReason: null | string;

  @ApiProperty({ title: 'Roles', type: RoleDto, isArray: true })
  roles: RoleDto[];

  @Exclude()
  admin: Moderator;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
