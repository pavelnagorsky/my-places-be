import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { PlaceTypeDto } from '../../place-types/dto/place-type.dto';
import { PlaceType } from '../../place-types/entities/place-type.entity';
import { PlaceCategoryDto } from '../../place-categories/dto/place-category.dto';
import { PlaceCategory } from '../../place-categories/entities/place-category.entity';
import { Image } from '../../images/entities/image.entity';
import { Place } from '../entities/place.entity';
import { Like } from '../../likes/entities/like.entity';
import { PlaceStatusesEnum } from '../enums/place-statuses.enum';
import { CoordinatesDto } from './coordinates.dto';

export class PlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place url path' })
  slug: string;

  @ApiProperty({ type: String, description: 'Place title' })
  @Transform(
    ({ value }: { value: Partial<TranslationBaseEntity> }) =>
      value?.text ?? null,
  )
  title: string;

  @ApiProperty({ type: String, description: 'Place description' })
  @Transform(
    ({ value }: { value: Partial<TranslationBaseEntity> }) =>
      value?.text ?? null,
  )
  description: string;

  @ApiProperty({ type: String, description: 'Place address' })
  @Transform(
    ({ value }: { value: Partial<TranslationBaseEntity> }) =>
      value?.text ?? null,
  )
  address: string;

  @ApiProperty({ type: PlaceTypeDto, description: 'Place type' })
  @Transform(
    ({ value }: { value: Partial<PlaceType> }) => new PlaceTypeDto(value),
  )
  type: PlaceTypeDto;

  @ApiProperty({ type: Number, description: 'Likes count' })
  likesCount: number;

  @ApiProperty({ type: Number, description: 'Views count' })
  viewsCount: number;

  @ApiProperty({
    type: PlaceCategoryDto,
    description: 'Place categories',
    isArray: true,
  })
  @Transform(({ value }: { value: Partial<PlaceCategory>[] }) =>
    value.map((category) => new PlaceCategoryDto(category)),
  )
  categories: PlaceCategoryDto[];

  @Exclude()
  comments: Comment[];

  @Exclude()
  likes: Like[];

  @ApiProperty({
    type: String,
    description: 'Place images',
    isArray: true,
  })
  @Transform(
    ({ value }: { value: Partial<Image>[] }) =>
      value?.filter((v) => Boolean(v.url)).map((v) => v.url) ?? [],
  )
  images: string[];

  @ApiProperty({ type: String, description: 'Place coordinates [lat;lng]' })
  @Transform(({ value }: { value: string }) => new CoordinatesDto(value))
  coordinates: string;

  @ApiProperty({
    type: String,
    description: 'Place website url',
    nullable: true,
  })
  website: string | null;

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
  status: PlaceStatusesEnum;

  @ApiProperty({
    type: Date,
    description: 'created at',
  })
  createdAt: Date;

  constructor(partial: Partial<Place>) {
    Object.assign(this, partial);
  }
}
