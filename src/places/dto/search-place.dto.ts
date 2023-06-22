import { ApiProperty } from '@nestjs/swagger';
import { Place } from '../entities/place.entity';
import { Exclude, Expose, Transform } from 'class-transformer';
import { PlaceTypeDto } from '../../place-types/dto/place-type.dto';
import { PlaceType } from '../../place-types/entities/place-type.entity';
import { PlaceCategoryDto } from '../../place-categories/dto/place-category.dto';
import { PlaceCategory } from '../../place-categories/entities/place-category.entity';
import { Image } from '../../images/entities/image.entity';
import { Translation } from '../../translations/entities/translation.entity';
import { CoordinatesDto } from './coordinates.dto';

export class SearchPlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place url path' })
  slug: string;

  @ApiProperty({ type: String, description: 'Place title' })
  @Transform(
    ({ value }: { value: Partial<Translation> }) => value?.text ?? null,
  )
  title: string;

  @ApiProperty({ type: String, description: 'Place description' })
  @Transform(
    ({ value }: { value: Partial<Translation> }) => value?.text ?? null,
  )
  description: string;

  @ApiProperty({ type: Number, description: 'Likes count' })
  likesCount: number;

  @ApiProperty({ type: Number, description: 'Views count' })
  viewsCount: number;

  @ApiProperty({ type: String, description: 'Place address' })
  @Transform(
    ({ value }: { value: Partial<Translation> }) => value?.text ?? null,
  )
  address: string;

  @ApiProperty({ type: PlaceTypeDto, description: 'Place type' })
  @Transform(
    ({ value }: { value: Partial<PlaceType> }) => new PlaceTypeDto(value),
  )
  type: PlaceTypeDto;

  @ApiProperty({
    type: PlaceCategoryDto,
    description: 'Place categories',
    isArray: true,
  })
  @Transform(({ value }: { value: Partial<PlaceCategory>[] }) =>
    value.map((category) => new PlaceCategoryDto(category)),
  )
  categories: PlaceCategoryDto[];

  @ApiProperty({
    type: String,
    description: 'Place image',
  })
  @Expose({ name: 'image' })
  @Transform(({ value }: { value: Partial<Image> }) => value?.url ?? null)
  images: string;

  @ApiProperty({
    type: CoordinatesDto,
    description: 'Place coordinates [lat;lng]',
  })
  @Transform(({ value }: { value: string }) => new CoordinatesDto(value))
  coordinates: CoordinatesDto;

  @ApiProperty({
    type: String,
    description: 'Place website url',
    nullable: true,
  })
  website?: string;

  @ApiProperty({
    type: Boolean,
    description: 'is place an advertisement',
  })
  advertisement: boolean;

  @ApiProperty({
    type: Date,
    description: 'advertisement end date',
    nullable: true,
  })
  advEndDate: Date | null;

  @Exclude()
  moderation: boolean;

  @ApiProperty({
    type: Date,
    description: 'created at',
  })
  createdAt: Date;

  constructor(partial: Partial<Place>) {
    Object.assign(this, partial);
  }
}
