import { ApiProperty } from '@nestjs/swagger';
import { Place } from '../entities/place.entity';
import { Exclude, Transform } from 'class-transformer';
import { TranslationDto } from '../../translations/dto/translation.dto';
import { PlaceTypeDto } from '../../place-types/dto/place-type.dto';
import { PlaceType } from '../../place-types/entities/place-type.entity';
import { PlaceCategoryDto } from '../../place-categories/dto/place-category.dto';
import { PlaceCategory } from '../../place-categories/entities/place-category.entity';
import { Image } from '../../images/entities/image.entity';

export class PlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place title' })
  @Transform(({ value }: { value: Partial<TranslationDto> }) => value.text)
  title: string;

  @ApiProperty({ type: String, description: 'Place description' })
  @Transform(({ value }: { value: Partial<TranslationDto> }) => value.text)
  description: string;

  @ApiProperty({ type: String, description: 'Place address' })
  @Transform(({ value }: { value: Partial<TranslationDto> }) => value.text)
  address: string;

  @ApiProperty({ type: PlaceTypeDto, description: 'Place type' })
  @Transform(
    ({ value }: { value: Partial<PlaceType> }) => new PlaceTypeDto(value),
  )
  placeType: PlaceTypeDto;

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
    description: 'Place images',
    isArray: true,
  })
  @Transform(({ value }: { value: Partial<Image>[] }) =>
    value.filter((image) => image.url).map((image) => image.url),
  )
  images: string[];

  @ApiProperty({ type: String, description: 'Place coordinates [lat;lng]' })
  coordinates: string;

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
