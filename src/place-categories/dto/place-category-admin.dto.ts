import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { TranslationDto } from '../../translations/dto/translation.dto';
import { PlaceCategory } from '../entities/place-category.entity';
import { ImageDto } from '../../images/dto/image.dto';

export class PlaceCategoryAdminDto {
  @ApiProperty({ title: 'Place category id', type: Number })
  id: number;

  @ApiProperty({
    title: 'Place category title',
    type: TranslationDto,
    isArray: true,
  })
  @Transform(({ value }) => {
    return value.map((c: any) => new TranslationDto(c));
  })
  titleTranslations: TranslationDto[];

  @Exclude()
  title: number;

  @ApiProperty({ title: 'Image url', type: ImageDto, nullable: true })
  image: ImageDto | null;

  @ApiProperty({ title: 'Image 2 url', type: ImageDto, nullable: true })
  image2: ImageDto | null;

  constructor(partial: Partial<PlaceCategory>) {
    Object.assign(this, partial);
  }
}
