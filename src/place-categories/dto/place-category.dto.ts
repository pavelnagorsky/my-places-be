import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TranslationDto } from '../../translations/dto/translation.dto';
import { Image } from '../../images/entities/image.entity';
import { PlaceCategory } from '../entities/place-category.entity';

export class PlaceCategoryDto {
  @ApiProperty({ title: 'Place category id', type: Number })
  id: number;

  @ApiProperty({ title: 'Place category title', type: String })
  @Transform(({ value }: { value: Partial<TranslationDto> }) => value.text)
  title: string;

  @ApiProperty({ title: 'Image url', type: String, nullable: true })
  @Transform(
    ({ value }: { value: Partial<Image> | null }) => value?.url || null,
  )
  image: string;

  @ApiProperty({ title: 'Image 2 url', type: String, nullable: true })
  @Transform(
    ({ value }: { value: Partial<Image> | null }) => value?.url || null,
  )
  image2: string;

  constructor(partial: Partial<PlaceCategory>) {
    Object.assign(this, partial);
  }
}
