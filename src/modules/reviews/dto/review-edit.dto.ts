import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ReviewTranslation } from '../entities/review-translation.entity';
import { Review } from '../entities/review.entity';
import { Place } from '../../places/entities/place.entity';
import { ImageDto } from '../../images/dto/image.dto';

export class ReviewEditDto {
  @ApiProperty({ title: 'Review id', type: Number })
  id: number;

  @ApiProperty({
    type: ImageDto,
    description: 'Review images',
    isArray: true,
  })
  images: ImageDto[];

  @ApiProperty({ type: String, description: 'Review title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: ReviewTranslation[];

  @ApiProperty({ type: String, description: 'Review description' })
  @Expose()
  get description(): string {
    return this.translations[0]?.description || '';
  }

  @ApiProperty({ type: Number, description: 'Place id' })
  @Expose()
  get placeId(): number {
    return this.place.id;
  }

  @ApiProperty({ type: String, description: 'Place title' })
  @Expose()
  get placeTitle(): string {
    return this.place.translations[0]?.title || '';
  }

  @Exclude()
  place: Place;

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
