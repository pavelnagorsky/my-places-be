import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { PlaceStatusesEnum } from '../../places/enums/place-statuses.enum';
import { Image } from '../../images/entities/image.entity';
import { Review } from '../entities/review.entity';
import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { User } from '../../users/entities/user.entity';

export class ReviewDto {
  @ApiProperty({ type: String, description: 'Review title' })
  @Expose()
  get title(): string {
    return this.titles[0]?.text || '';
  }

  @Exclude()
  titles: TranslationBaseEntity[];

  @ApiProperty({ type: String, description: 'Review description' })
  @Expose()
  get description(): string {
    return this.descriptions[0]?.text || '';
  }

  @Exclude()
  descriptions: TranslationBaseEntity[];

  @Exclude()
  status: PlaceStatusesEnum;

  @ApiProperty({ title: 'Author username', type: String })
  @Expose()
  get authorUsername(): string {
    return `${this.author?.firstName} ${this.author?.lastName}`;
  }

  @Exclude()
  author: Partial<User>;

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

  @ApiProperty({
    type: Date,
    description: 'Updated at',
  })
  updatedAt: Date;

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
