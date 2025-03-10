import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { PlaceTranslation } from '../../places/entities/place-translation.entity';
import { CoordinatesDto } from '../../places/dto/coordinates.dto';
import { ExcursionPlace } from '../entities/excursion-place.entity';

export class ExcursionsListItemPlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place url path' })
  slug: string;

  @ApiProperty({ type: String, description: 'Place title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @ApiProperty({
    title: 'Excursion leg view duration in minutes',
    type: Number,
  })
  excursionDuration: number;

  @Exclude()
  translations: PlaceTranslation[];

  @ApiProperty({
    type: Number,
    description: 'Excursion leg movement duration in minutes',
  })
  duration: number;

  @ApiProperty({ type: Number, description: 'Excursion leg distance in km' })
  distance: number;

  @ApiProperty({
    type: CoordinatesDto,
    description: 'Place coordinates [lat;lng]',
  })
  @Transform(({ value }: { value: string }) => new CoordinatesDto(value))
  coordinates: CoordinatesDto;

  constructor(partial: Partial<ExcursionPlace>) {
    Object.assign(this, partial.place);
    this.distance = partial.distance || 0;
    this.duration = partial.duration || 0;
    this.excursionDuration = partial.excursionDuration || 0;
  }
}
