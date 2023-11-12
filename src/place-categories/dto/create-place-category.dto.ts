import { ApiProperty } from '@nestjs/swagger';
import { PlaceCategoryTranslationDto } from './place-category-translation.dto';
import { IsArray, IsNumber, ValidateIf, ValidateNested } from 'class-validator';

export class CreatePlaceCategoryDto {
  @ApiProperty({
    title: 'Place category title',
    type: PlaceCategoryTranslationDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  titleTranslations: PlaceCategoryTranslationDto[];

  @ApiProperty({ title: 'Place category image', type: Number, required: false })
  @IsNumber()
  @ValidateIf((object, value) => Boolean(value))
  imageId?: number;

  @ApiProperty({
    title: 'Place category image 2',
    type: Number,
    required: false,
  })
  @IsNumber()
  @ValidateIf((object, value) => Boolean(value))
  imageId2?: number;
}
