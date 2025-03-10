import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { ExcursionTranslation } from '../entities/excursion-translation.entity';
import { ExcursionPlaceDto } from './excursion-place.dto';
import { ExcursionPlace } from '../entities/excursion-place.entity';
import { ExcursionTypesEnum } from '../enums/excursion-types.enum';
import { TravelModesEnum } from 'src/modules/routes/enums/travel-modes.enum';
import { Excursion } from '../entities/excursion.entity';

export class ExcursionDto {
  @ApiProperty({ title: 'Excursion id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Excursion url path' })
  slug: string;

  @ApiProperty({ type: String, description: 'Excursion title' })
  @Expose()
  get title(): string {
    return this.translations[0]?.title || '';
  }

  @ApiProperty({ type: String, description: 'Excursion description' })
  @Expose()
  get description(): string {
    return this.translations[0]?.title || '';
  }

  @Exclude()
  translations: ExcursionTranslation[];

  @ApiProperty({
    type: Number,
    description: 'Excursion movement duration in minutes',
  })
  duration: number;

  @ApiProperty({ title: 'Excursion view duration in minutes', type: Number })
  @Expose()
  get excursionDuration(): number {
    return this.places.reduce((acc, currentValue) => {
      return acc + currentValue.excursionDuration || 0;
    }, 0);
  }

  @ApiProperty({ type: Number, description: 'Excursion distance in km' })
  distance: number;

  @ApiProperty({
    type: ExcursionPlaceDto,
    isArray: true,
    description: 'Excursion places',
  })
  places: ExcursionPlaceDto[];

  @Exclude()
  excursionPlaces: ExcursionPlace[];

  @ApiProperty({
    type: Date,
    description: 'created at',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'updated at',
  })
  updatedAt: Date;

  @ApiProperty({
    enum: ExcursionTypesEnum,
    description: 'Excursion type',
  })
  type: ExcursionTypesEnum;

  @ApiProperty({
    enum: TravelModesEnum,
    description: 'Travel mode',
  })
  travelMode: TravelModesEnum;

  @ApiProperty({ title: 'Views count', type: Number })
  viewsCount: number;

  constructor(partial: Partial<Excursion>) {
    Object.assign(this, partial);
    this.places = (partial.excursionPlaces ?? []).map(
      (excursionPlace) => new ExcursionPlaceDto(excursionPlace),
    );
  }
}
