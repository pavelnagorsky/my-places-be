import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { PlaceStatusesEnum } from '../../places/enums/place-statuses.enum';
import { Image } from '../../images/entities/image.entity';
import { Review } from '../entities/review.entity';
import { Translation } from '../../translations/entities/translation.entity';

export class ReviewDto {
  @ApiProperty({ type: String, description: 'Review title' })
  @Transform(
    ({ value }: { value: Partial<Translation> }) => value?.text ?? null,
  )
  title: string;

  @ApiProperty({ type: String, description: 'Review description' })
  @Transform(
    ({ value }: { value: Partial<Translation> }) => value?.text ?? null,
  )
  description: string;

  @Exclude()
  status: PlaceStatusesEnum;

  @ApiProperty({
    type: String,
    description: 'Review images',
    isArray: true,
  })
  @Transform(
    ({ value }: { value: Partial<Image>[] }) =>
      value?.filter((v) => Boolean(v.url)).map((v) => v.url) ?? [],
  )
  images: string[];

  @ApiProperty({
    type: Date,
    description: 'Created at',
  })
  createdAt: Date;

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
