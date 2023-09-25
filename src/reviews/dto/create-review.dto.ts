import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ type: String, description: 'Review title' })
  @IsString()
  title: string;

  @ApiProperty({ type: String, description: 'Review description' })
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
