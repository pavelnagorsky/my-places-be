import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { ReviewStatusesEnum } from '../enums/review-statuses.enum';
import { Review } from '../entities/review.entity';
import { ReviewTranslation } from '../entities/review-translation.entity';
import { Place } from '../../places/entities/place.entity';
import { User } from '../../users/entities/user.entity';

export class MyReviewDto {
  @ApiProperty({ title: 'Review id', type: Number })
  id: number;

  @ApiProperty({ enum: ReviewStatusesEnum, description: 'Review status' })
  status: ReviewStatusesEnum;

  @ApiProperty({
    type: String,
    description: 'Review moderation feedback',
    nullable: true,
  })
  moderationMessage: string | null;

  @ApiProperty({ type: String, description: 'Review title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: ReviewTranslation[];

  @ApiProperty({ type: Number, description: 'Views count' })
  viewsCount: number;

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

  @ApiProperty({ type: String, description: 'Place title' })
  @Expose()
  get placeTitle(): string {
    return this.place.translations[0]?.title || '';
  }

  @ApiProperty({ type: String, description: 'Place slug' })
  @Expose()
  get placeSlug(): string {
    return this.place.slug;
  }

  @ApiProperty({ type: String, description: 'Place id' })
  @Expose()
  get placeId(): number {
    return this.place.id;
  }

  @Exclude()
  place: Place;

  @ApiProperty({
    type: String,
    description: 'author username',
    nullable: true,
  })
  @Transform(({ value }: { value: Partial<User> | null }) => {
    return value ? `${value.firstName} ${value.lastName}` : null;
  })
  author: string;

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
