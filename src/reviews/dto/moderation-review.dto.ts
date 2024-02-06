import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ReviewTranslation } from '../entities/review-translation.entity';
import { Place } from '../../places/entities/place.entity';
import { Review } from '../entities/review.entity';
import { User } from '../../users/entities/user.entity';

export class ModerationReviewDto {
  @ApiProperty({ title: 'Review id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Review title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: ReviewTranslation[];

  @Exclude()
  author: User;

  @ApiProperty({ type: String, description: 'Author username' })
  @Expose()
  get authorName(): string {
    return `${this.author.firstName} ${this.author.lastName}`;
  }

  @ApiProperty({ type: String, description: 'Author email' })
  @Expose()
  get authorEmail(): string {
    return this.author.email;
  }

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

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
