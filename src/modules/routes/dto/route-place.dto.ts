import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { PlaceTranslation } from '../../places/entities/place-translation.entity';
import { RoutePlace } from '../entities/route-place.entity';

export class RoutePlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place url path' })
  slug: string;

  @ApiProperty({ type: String, description: 'Place title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: PlaceTranslation[];

  constructor(partial: Partial<RoutePlace>) {
    Object.assign(this, partial.place);
  }
}
