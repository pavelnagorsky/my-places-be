import { Exclude, Expose, Transform } from 'class-transformer';
import { PlaceType } from '../entities/place-type.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Image } from '../../images/entities/image.entity';
import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';

export class PlaceTypeDto {
  @ApiProperty({ title: 'Place type id', type: Number })
  id: number;

  @Exclude()
  titles: TranslationBaseEntity[];

  @ApiProperty({ title: 'Place type title', type: String })
  @Expose()
  get title(): string {
    return this.titles[0]?.text || '';
  }

  @ApiProperty({
    title: 'Place type is commercial',
    type: Boolean,
    default: false,
  })
  commercial: boolean;

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

  constructor(partial: Partial<PlaceType>) {
    Object.assign(this, partial);
  }
}
