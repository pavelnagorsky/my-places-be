import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { User } from '../entities/user.entity';
import { Moderator } from '../entities/moderator.entity';

export class ModeratorDto {
  @ApiProperty({ title: 'Moderator id', type: Number })
  id: number;

  @ApiProperty({
    title: 'User id',
    type: Number,
  })
  @Expose()
  get userId(): number {
    return this.user?.id;
  }

  @Exclude()
  user: User;

  @ApiProperty({ title: 'Moderator address', type: String })
  @Transform(({ value }) => value || '')
  address: string;

  @ApiProperty({ title: 'Moderator phone', type: String })
  @Transform(({ value }) => value || '')
  phone: string;

  constructor(partial: Partial<Moderator>) {
    Object.assign(this, partial);
  }
}
