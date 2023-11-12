import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PlaceTypeTranslationDto } from './place-type-translation.dto';

export class CreatePlaceTypeDto {
  @ApiProperty({
    title: 'Place category title',
    type: PlaceTypeTranslationDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  titleTranslations: PlaceTypeTranslationDto[];

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

  @ApiProperty({ title: 'Place type image 2', type: Number, required: false })
  @IsNumber()
  @ValidateIf((object, value) => Boolean(value))
  imageId2?: number;
}
