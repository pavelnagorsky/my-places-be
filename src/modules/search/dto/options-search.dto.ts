import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { PlaceTranslation } from '../../places/entities/place-translation.entity';
import { Place } from '../../places/entities/place.entity';

export class OptionsSearchDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place url path' })
  slug: string;

  @ApiProperty({ type: String, description: 'Place title' })
  label: string;

  @Exclude()
  translations: PlaceTranslation[];

  @Exclude()
  _languageId: number;

  constructor(partial: Partial<Place>, languageId: number) {
    this.id = partial.id as number;
    this.slug = partial.slug as string;
    this._languageId = languageId;
    const translation = (partial.translations ?? []).find(
      (translation) => translation.language?.id === languageId,
    );
    this.label = translation?.title || '';
  }
}
