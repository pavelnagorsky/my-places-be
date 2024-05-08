import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { PlaceTypeDto } from '../../place-types/dto/place-type.dto';
import { PlaceType } from '../../place-types/entities/place-type.entity';
import { PlaceCategoryDto } from '../../place-categories/dto/place-category.dto';
import { PlaceCategory } from '../../place-categories/entities/place-category.entity';
import { Image } from '../../images/entities/image.entity';
import { PlaceTranslation } from '../../places/entities/place-translation.entity';
import { CoordinatesDto } from '../../places/dto/coordinates.dto';
import { PlaceStatusesEnum } from '../../places/enums/place-statuses.enum';
import { Place } from '../../places/entities/place.entity';

export class SearchPlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place url path' })
  slug: string;

  @ApiProperty({ type: String, description: 'Place title' })
  title: string;

  @Exclude()
  translations: PlaceTranslation[];

  @ApiProperty({ type: String, description: 'Place description' })
  description: string;

  @ApiProperty({ type: Number, description: 'Likes count' })
  likesCount: number;

  @ApiProperty({ type: Number, description: 'Views count' })
  viewsCount: number;

  @ApiProperty({ type: String, description: 'Place address' })
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
  status: PlaceStatusesEnum;

  @ApiProperty({
    type: Date,
    description: 'created at',
  })
  createdAt: Date;

  constructor(partial: Partial<Place>, languageId: number) {
    Object.assign(this, partial);
    const translation = (partial.translations ?? []).find(
      (translation) => translation.language?.id === languageId,
    );
    this.title = translation?.title || '';
    this.description = translation?.description || '';
    this.address = translation?.address || '';
  }
}
