import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({ type: String, description: 'Review title' })
  @Transform(({ value }) => value.trim())
  @IsString()
  title: string;

  @ApiProperty({ type: String, description: 'Review description' })
  @Transform(({ value }) => value.trim())
  @IsString()
  description: string;

  @ApiProperty({ type: String, description: 'Place id' })
  @IsNumber()
  placeId: number;

  @ApiProperty({
    type: Number,
    description: 'Review images ids',
    isArray: true,
  })
  @IsNumber({}, { each: true })
  imagesIds: number[];
}
