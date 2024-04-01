import { Place } from '../entities/place.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { PlaceTranslation } from '../entities/place-translation.entity';
import { User } from '../../users/entities/user.entity';
import { PlaceStatusesEnum } from '../enums/place-statuses.enum';

export class PlaceForEmailDto {
  @ApiProperty({ type: String, description: 'Place title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: PlaceTranslation[];

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

  @ApiProperty({ enum: PlaceStatusesEnum, description: 'Place status' })
  status: PlaceStatusesEnum;

  @ApiProperty({
    type: Boolean,
    description: 'is place an advertisement',
  })
  advertisement: boolean;

  @ApiProperty({
    type: Date,
    description: 'advertisement end date',
    nullable: true,
  })
  advEndDate: Date | null;

  constructor(partial: Partial<Place>) {
    Object.assign(this, partial);
  }
}
