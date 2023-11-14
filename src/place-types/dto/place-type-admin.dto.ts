import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { TranslationDto } from '../../translations/dto/translation.dto';
import { ImageDto } from '../../images/dto/image.dto';
import { PlaceType } from '../entities/place-type.entity';

export class PlaceTypeAdminDto {
  @ApiProperty({ title: 'Place type id', type: Number })
  id: number;

  @ApiProperty({
    title: 'Place type title',
    type: TranslationDto,
    isArray: true,
  })
  @Transform(({ value }) => {
    return value.map((t: any) => new TranslationDto(t));
  })
  titleTranslations: TranslationDto[];

  @Exclude()
  title: number;

  @ApiProperty({
    title: 'Place type is commercial',
    type: Boolean,
    default: false,
  })
  commercial: boolean;

  @ApiProperty({ title: 'Image url', type: ImageDto, nullable: true })
  image: ImageDto | null;

  @ApiProperty({ title: 'Image 2 url', type: ImageDto, nullable: true })
  image2: ImageDto | null;

  constructor(partial: Partial<PlaceType>) {
    Object.assign(this, partial);
  }
}
