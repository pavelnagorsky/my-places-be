import { ApiProperty } from '@nestjs/swagger';

export class CreateTranslationDto {
  @ApiProperty({ title: 'Text id', type: Number })
  textId: number;

  @ApiProperty({ title: 'Text', type: String })
  text: string;

  @ApiProperty({
    title: 'Original language',
    type: Boolean,
    default: false,
  })
  original: boolean;

  @ApiProperty({ title: 'Language id', type: Number })
  langId: number;
}
