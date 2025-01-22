import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { PlaceTranslation } from '../../places/entities/place-translation.entity';
import { RoutePlace } from '../entities/route-place.entity';
import { CoordinatesDto } from '../../places/dto/coordinates.dto';

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

  @ApiProperty({ type: Number, description: 'Route leg duration in minutes' })
  duration: number;

  @ApiProperty({ type: Number, description: 'Route leg distance in km' })
  distance: number;

  @ApiProperty({
    type: CoordinatesDto,
    description: 'Place coordinates [lat;lng]',
  })
  @Transform(({ value }: { value: string }) => new CoordinatesDto(value))
  coordinates: CoordinatesDto;

  constructor(partial: Partial<RoutePlace>) {
    Object.assign(this, partial.place);
    this.distance = partial.distance || 0;
    this.duration = partial.duration || 0;
  }
}
