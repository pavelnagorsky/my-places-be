import { ApiProperty } from '@nestjs/swagger';
import { LanguageIdEnum } from '../enums/language-id.enum';

export class CreateLanguageDto {
  @ApiProperty({ title: 'Language id', enum: LanguageIdEnum })
  id: LanguageIdEnum;

  @ApiProperty({ title: 'Language title', type: String })
  title: string;

  @ApiProperty({ title: 'Language code', type: String })
  code: string;
}
