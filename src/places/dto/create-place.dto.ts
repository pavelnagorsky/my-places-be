import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsBoolean,
  IsNumber,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty({ type: String, description: 'Place url path' })
  @IsString()
  slug: string;

  @ApiProperty({ type: String, description: 'Place title' })
  @IsString()
  @MaxLength(300)
  title: string;

  @ApiProperty({ type: String, description: 'Place description' })
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ type: String, description: 'Place address' })
  @IsString()
  @MaxLength(300)
  address: string;

  @ApiProperty({ type: Number, description: 'Place type id' })
  @IsNumber()
  placeTypeId: number;

  @ApiProperty({
    type: Number,
    description: 'Place categories ids',
    isArray: true,
  })
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  categoriesIds: number[];

  @ApiProperty({
    type: Number,
    description: 'Place images ids',
    isArray: true,
  })
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  imagesIds: number[];

  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Is commercial place',
  })
  @IsBoolean()
  isCommercial: boolean;

  @ApiProperty({ type: String, description: 'Place coordinates [lat;lng]' })
  @IsString()
  coordinates: string;

  @ApiProperty({
    type: String,
    description: 'Place website url',
    required: false,
  })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  website?: string;
}
