import { Translation } from '../entities/translation.entity';
import { ApiProperty } from '@nestjs/swagger';

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
  language: number;

  constructor(partial: Partial<Translation>) {
    Object.assign(this, partial);
  }
}
