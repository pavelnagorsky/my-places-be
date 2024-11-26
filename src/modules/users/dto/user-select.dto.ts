import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { User } from '../entities/user.entity';

export class UserSelectDto {
  @ApiProperty({ title: 'User id', type: Number, default: 1 })
  id: number;

  @ApiProperty({ title: 'User Name', type: String })
  @Expose()
  get userName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Exclude()
  firstName: string;

  @Exclude()
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
