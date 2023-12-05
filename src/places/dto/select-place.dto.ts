import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { TranslationBaseEntity } from '../../translations/entities/translation-base.entity';
import { Place } from '../entities/place.entity';

export class SelectPlaceDto {
  @ApiProperty({ title: 'Place id', type: Number })
  id: number;

  @ApiProperty({ type: String, description: 'Place title' })
  @Expose()
  get title(): string {
    return this.titles[0]?.text || '';
  }

  @Exclude()
  titles: TranslationBaseEntity[];

  constructor(partial: Partial<Place>) {
    Object.assign(this, partial);
  }
}
