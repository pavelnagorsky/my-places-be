import { Transform } from 'class-transformer';
import { PlaceType } from '../entities/place-type.entity';
import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../translations/dto/translation.dto';
import { Image } from '../../entities/image.entity';

export class PlaceTypeDto {
  @ApiProperty({ title: 'Place type id', type: Number })
  id: number;

  @ApiProperty({ title: 'Place type title', type: String })
  @Transform(({ value }: { value: Partial<TranslationDto> }) => value.text)
  title: string;

  @ApiProperty({
    title: 'Place type is commercial',
    type: Boolean,
    default: false,
  })
  commercial: boolean;

  @ApiProperty({ title: 'Image url', type: String, nullable: true })
  @Transform(
    ({ value }: { value: Partial<Image> | null }) => value?.url || null,
  )
  image: string;

  constructor(partial: Partial<PlaceType>) {
    Object.assign(this, partial);
  }
}
