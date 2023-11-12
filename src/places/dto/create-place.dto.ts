import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaceDto {
  @ApiProperty({ type: String, description: 'Place url path' })
  slug: string;

  @ApiProperty({ type: String, description: 'Place title' })
  title: string;

  @ApiProperty({ type: String, description: 'Place description' })
  description: string;

  @ApiProperty({ type: String, description: 'Place address' })
  address: string;

  @ApiProperty({ type: Number, description: 'Place type id' })
  placeTypeId: number;

  @ApiProperty({
    type: Number,
    description: 'Place categories ids',
    isArray: true,
  })
  categoriesIds: number[];

  @ApiProperty({
    type: Number,
    description: 'Place images ids',
    isArray: true,
  })
  imagesIds: number[];

  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Is commercial place',
  })
  isCommercial: boolean;

  @ApiProperty({ type: String, description: 'Place coordinates [lat;lng]' })
  coordinates: string;

  @ApiProperty({
    type: String,
    description: 'Place website url',
    required: false,
  })
  website?: string;
}
