import { ApiProperty } from '@nestjs/swagger';
import { Route } from '../entities/route.entity';
import { RoutePlaceDto } from './route-place.dto';
import { RoutePlace } from '../entities/route-place.entity';
import { Exclude, Transform } from 'class-transformer';
import { CoordinatesDto } from '../../places/dto/coordinates.dto';
import { IsDateString, IsEnum } from 'class-validator';
import { TravelModesEnum } from '../enums/travel-modes.enum';

export class RouteDto {
  @ApiProperty({ title: 'Route id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Route title' })
  title: string;

  @ApiProperty({ type: Number, description: 'Route duration in minutes' })
  duration: number;

  @ApiProperty({ type: Number, description: 'Route distance in km' })
  distance: number;

  @ApiProperty({
    type: RoutePlaceDto,
    isArray: true,
    description: 'Route places',
  })
  places: RoutePlaceDto[];

  @ApiProperty({
    type: CoordinatesDto,
    description: 'Route start coordinates [lat;lng]',
  })
  @Transform(({ value }: { value: string }) => new CoordinatesDto(value))
  coordinatesStart: CoordinatesDto;

  @ApiProperty({
    type: CoordinatesDto,
    description: 'Route destination coordinates [lat;lng]',
  })
  @Transform(({ value }: { value: string }) => new CoordinatesDto(value))
  coordinatesEnd: string;

  @Exclude()
  routePlaces: RoutePlace[];

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
    type: Number,
    description: 'Distance in km - from last place to end of the route',
  })
  lastRouteLegDistance: number;

  @ApiProperty({
    type: Number,
    description: 'Duration in minutes - from last place to end of the route',
  })
  lastRouteLegDuration: number;

  @ApiProperty({
    enum: TravelModesEnum,
    description: 'Travel mode',
  })
  travelMode: TravelModesEnum;

  constructor(partial: Partial<Route>) {
    Object.assign(this, partial);
    this.places = (partial.routePlaces ?? []).map(
      (routePlace) => new RoutePlaceDto(routePlace),
    );
  }
}
