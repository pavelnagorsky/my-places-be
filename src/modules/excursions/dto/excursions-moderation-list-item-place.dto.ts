import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { PlaceTranslation } from '../../places/entities/place-translation.entity';
import { ExcursionPlace } from '../entities/excursion-place.entity';

export class ExcursionsModerationListItemPlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: PlaceTranslation[];

  constructor(partial: Partial<ExcursionPlace>) {
    Object.assign(this, partial.place);
  }
}
