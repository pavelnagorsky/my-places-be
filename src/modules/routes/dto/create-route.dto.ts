import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsDateString,
  IsEnum,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { regularExpressions } from '../../../shared/regular-expressions';
import { TravelModesEnum } from '../enums/travel-modes.enum';

export class CreateRouteDto {
  @ApiProperty({ type: String, description: 'Place title' })
  @Transform(({ value }) => value.trim())
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty({
    type: Number,
    description: 'Place ids',
    isArray: true,
  })
  @ArrayMinSize(1)
  @ArrayMaxSize(25, {
    message: 'Maximum 25 waypoints ',
  })
  @IsNumber({}, { each: true })
  placeIds: number[];

  @ApiProperty({
    type: String,
    description: 'Route start coordinates [lat;lng]',
  })
  @Matches(regularExpressions.coordinates)
  coordinatesStart: string;

  @ApiProperty({ type: String, description: 'Route end coordinates [lat;lng]' })
  @Matches(regularExpressions.coordinates)
  coordinatesEnd: string;

  @ApiProperty({
    enum: TravelModesEnum,
    description: 'Travel mode',
    default: TravelModesEnum.DRIVING,
  })
  @IsEnum(TravelModesEnum)
  travelMode: TravelModesEnum;
}
