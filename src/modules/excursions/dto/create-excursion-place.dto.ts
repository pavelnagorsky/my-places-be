import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateExcursionPlaceDto {
  @ApiProperty({
    type: Number,
    description: 'Place id',
  })
  @IsNumber()
  id: number;
}
