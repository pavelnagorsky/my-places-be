import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsEnum,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { regularExpressions } from '../../../shared/regular-expressions';
import { TravelModesEnum } from '../../routes/enums/travel-modes.enum';

export class CreateExcursionDto {
  @ApiProperty({ type: String, description: 'Excursion title' })
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
  @IsNumber({}, { each: true })
  placeIds: number[];

  @ApiProperty({
    enum: TravelModesEnum,
    description: 'Travel mode',
    default: TravelModesEnum.DRIVING,
  })
  @IsEnum(TravelModesEnum)
  travelMode: TravelModesEnum;
}
