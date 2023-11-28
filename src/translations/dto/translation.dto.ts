import { TranslationBaseEntity } from '../entities/translation-base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class TranslationDto {
  @ApiProperty({ title: 'Translation id', type: Number })
  id: number;

  @ApiProperty({ title: 'TextID', type: Number })
  textId: number;

  @ApiProperty({ title: 'Text', type: String })
  text: string;

  @ApiProperty({
    title: 'Is original',
    type: Boolean,
  })
  original: boolean;

  @ApiProperty({ title: 'Language id', type: Number })
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    if (value?.id) return value.id;
    return null;
  })
  language: number;

  constructor(partial: Partial<TranslationBaseEntity>) {
    Object.assign(this, partial);
  }
}
