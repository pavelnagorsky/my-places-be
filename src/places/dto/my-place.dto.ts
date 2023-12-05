import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { PlaceStatusesEnum } from '../enums/place-statuses.enum';
import { PlaceType } from '../../place-types/entities/place-type.entity';
import { Place } from '../entities/place.entity';

export class MyPlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place url path' })
  slug: string;

  @ApiProperty({ enum: PlaceStatusesEnum, description: 'Place status' })
  status: PlaceStatusesEnum;

  @ApiProperty({ type: String, description: 'Place title' })
  @Expose()
  get title(): string {
    return this.titles[0]?.text || '';
  }

  @Exclude()
  titles: TranslationBaseEntity[];

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
  reviewsCount: number;

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

  // @Exclude()
  // comments: Comment[];
  //
  // @Exclude()
  // likes: Like[];

  constructor(partial: Partial<Place>) {
    Object.assign(this, partial);
  }
}
