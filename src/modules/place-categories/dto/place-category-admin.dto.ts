import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { TranslationDto } from '../../translations/dto/translation.dto';
import { PlaceCategory } from '../entities/place-category.entity';
import { ImageDto } from '../../images/dto/image.dto';
import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';

export class PlaceCategoryAdminDto {
  @ApiProperty({ title: 'Place category id', type: Number })
  id: number;

  @ApiProperty({
    title: 'Place category title',
    type: TranslationDto,
    isArray: true,
  })
  @Expose()
  get titleTranslations(): TranslationDto[] {
    return this.titles.map((t) => new TranslationDto(t));
  }

  @Exclude()
  titles: TranslationBaseEntity[];

  @ApiProperty({ title: 'Image url', type: ImageDto, nullable: true })
  image: ImageDto | null;

  @ApiProperty({ title: 'Image 2 url', type: ImageDto, nullable: true })
  image2: ImageDto | null;

  constructor(partial: Partial<PlaceCategory>) {
    Object.assign(this, partial);
  }
}
