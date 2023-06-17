import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreatePlaceTypeDto {
  @ApiProperty({ title: 'Place type title', type: String })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    title: 'Place type is commercial',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  commercial: boolean;

  @ApiProperty({ title: 'Place type image', type: Number, required: false })
  @IsNumber()
  @ValidateIf((object, value) => Boolean(value))
  imageId?: number;
}
