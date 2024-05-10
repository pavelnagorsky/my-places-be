import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Image } from '../../images/entities/image.entity';
import { PlaceCategory } from '../entities/place-category.entity';
import { PlaceCategoryTranslation } from '../entities/place-category-translation.entity';

export class PlaceCategoryDto {
  @ApiProperty({ title: 'Place category id', type: Number })
  id: number;

  @Exclude()
  titles: PlaceCategoryTranslation[];

  @ApiProperty({ title: 'Place category title', type: String })
  @Expose()
  get title(): string {
    return this.titles[0]?.text || '';
  }

  @ApiProperty({ title: 'Image url', type: String, nullable: true })
  @Transform(
    ({ value }: { value: Partial<Image> | null }) => value?.url || null,
  )
  image: string;

  @ApiProperty({ title: 'Image 2 url', type: String, nullable: true })
  @Transform(
    ({ value }: { value: Partial<Image> | null }) => value?.url || null,
  )
  image2: string;

  constructor(partial: Partial<PlaceCategory>, languageId?: number) {
    Object.assign(this, partial);
    if (languageId) {
      this.titles = this.titles.filter((t) => t.language?.id === languageId);
    }
  }
}
