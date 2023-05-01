import { ApiProperty } from '@nestjs/swagger';
import { CreateLanguageDto } from './create-language.dto';

export class LanguageDto extends CreateLanguageDto {
  @ApiProperty({ title: 'Language id', type: Number })
  id: number;
}
