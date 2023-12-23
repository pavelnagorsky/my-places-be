import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { PlaceTranslation } from '../entities/place-translation.entity';
import { Image } from '../../images/entities/image.entity';
import { CoordinatesDto } from './coordinates.dto';
import { Place } from '../entities/place.entity';

export class PlaceEditDto {
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

  @ApiProperty({ type: String, description: 'Place description' })
  @Expose()
  get description(): string {
    return this.translations[0]?.description || '';
  }

  @ApiProperty({ type: String, description: 'Place address' })
  @Expose()
  get address(): string {
    return this.translations[0]?.address || '';
  }

  @ApiProperty({ type: Number, description: 'Place type id' })
  @Expose()
  get typeId(): number {
    return this.type;
  }

  @Exclude()
  type: number;

  @ApiProperty({
    type: Number,
    description: 'Place categories ids',
    isArray: true,
  })
  @Expose()
  get categoriesIds(): number[] {
    return this.categories;
  }

  @Exclude()
  categories: number[];

  @ApiProperty({
    type: Image,
    description: 'Place images',
    isArray: true,
  })
  images: Image[];

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

  constructor(partial: Partial<Place>) {
    Object.assign(this, partial);
  }
}
