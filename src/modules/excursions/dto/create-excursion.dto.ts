import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsDateString,
  IsEnum,
  IsString,
  MaxLength,
} from 'class-validator';
import { TravelModesEnum } from '../../routes/enums/travel-modes.enum';
import { CreateExcursionPlaceDto } from './create-excursion-place.dto';

export class CreateExcursionDto {
  @ApiProperty({ type: String, description: 'Excursion title' })
  @Transform(({ value }) => value.trim())
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty({ type: String, description: 'Excursion description' })
  @Transform(({ value }) => value.trim())
  @IsString()
  description: string;

  @ApiProperty({
    type: CreateExcursionPlaceDto,
    description: 'Excursion places',
    isArray: true,
  })
  @ArrayMinSize(2, { message: 'Minimum 2 waypoints required' })
  places: CreateExcursionPlaceDto[];

  @ApiProperty({
    enum: TravelModesEnum,
    description: 'Travel mode',
    default: TravelModesEnum.DRIVING,
  })
  @IsEnum(TravelModesEnum)
  travelMode: TravelModesEnum;
}
