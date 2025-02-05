import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExcursionPlaceDto {
  @ApiProperty({
    type: Number,
    description: 'Place id',
  })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String, description: 'Excursion place description' })
  @Transform(({ value }) => value.trim())
  @IsString()
  description: string;

  @ApiProperty({
    type: Number,
    description: 'Excursion duration on place in minutes',
  })
  @IsNumber()
  excursionDuration: number;
}
