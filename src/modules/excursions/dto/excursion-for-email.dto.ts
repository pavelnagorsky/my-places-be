import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { ExcursionTranslation } from '../entities/excursion-translation.entity';
import { ExcursionStatusesEnum } from '../enums/excursion-statuses.enum';
import { Excursion } from '../entities/excursion.entity';

export class ExcursionForEmailDto {
  @ApiProperty({ type: String, description: 'Excursion title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: ExcursionTranslation[];

  @ApiProperty({ title: 'First Name', type: String, default: 'John' })
  @Expose()
  get firstName(): string {
    return this.author.firstName || '';
  }

  @ApiProperty({ title: 'Last Name', type: String, default: 'Doe' })
  @Expose()
  get lastName(): string {
    return this.author.lastName || '';
  }

  @ApiProperty({ title: 'Receive emails', type: Boolean })
  receiveEmails: boolean;

  @ApiProperty({ title: 'Email', type: String, default: 'johndoe@gmail.com' })
  @Expose()
  get email(): string {
    return this.author.email || '';
  }

  @Exclude()
  author: User;

  @ApiProperty({
    type: Date,
    description: 'created at',
  })
  createdAt: Date;

  @ApiProperty({ enum: ExcursionStatusesEnum, description: 'Excursion status' })
  status: ExcursionStatusesEnum;

  @ApiProperty({
    type: String,
    description: 'Moderation message',
  })
  moderationMessage: string | null;

  constructor(partial: Partial<Excursion>) {
    Object.assign(this, partial);
  }
}
