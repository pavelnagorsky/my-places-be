import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { PlaceStatusesEnum } from '../enums/place-statuses.enum';
import { PlaceType } from '../../place-types/entities/place-type.entity';
import { Place } from '../entities/place.entity';
import { PlaceTranslation } from '../entities/place-translation.entity';

export class MyPlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place url path' })
  slug: string;

  @ApiProperty({ enum: PlaceStatusesEnum, description: 'Place status' })
  status: PlaceStatusesEnum;

  @ApiProperty({
    type: String,
    description: 'Place moderation feedback',
    nullable: true,
  })
  moderationMessage: string | null;

  @ApiProperty({ type: String, description: 'Place title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: PlaceTranslation[];

  @ApiProperty({ type: String, description: 'Place type title' })
  @Transform(({ value }: { value: Partial<PlaceType> }) => {
    if (!!value.titles && value.titles.length > 0) {
      return value.titles[0].text;
    }
    return '';
  })
  type: string;

  @ApiProperty({ type: Number, description: 'Likes count' })
  likesCount: number;

  @ApiProperty({ type: Number, description: 'Views count' })
  viewsCount: number;

  @ApiProperty({ type: Number, description: 'Reviews count' })
  @Expose()
  get reviewsCount(): number {
    return this.reviews.length;
  }

  @Exclude()
  reviews: number[];

  @ApiProperty({ type: Number, description: 'Comments count' })
  @Expose()
  get commentsCount(): number {
    return this.comments.length;
  }

  @Exclude()
  comments: number[];

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

  @ApiProperty({
    type: Date,
    description: 'created at',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'updated at',
  })
  updatedAt: Date;

  constructor(partial: Partial<Place>) {
    Object.assign(this, partial);
  }
}
