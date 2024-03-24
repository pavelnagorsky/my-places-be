import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Place } from '../entities/place.entity';
import { PlaceTranslation } from '../entities/place-translation.entity';

export class SelectPlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: PlaceTranslation[];

  constructor(partial: Partial<Place>) {
    Object.assign(this, partial);
  }
}
