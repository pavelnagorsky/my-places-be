import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString, Matches, MaxLength } from 'class-validator';
import { regularExpressions } from '../../../shared/regular-expressions';

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
}
