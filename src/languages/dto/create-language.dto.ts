import { ApiProperty } from '@nestjs/swagger';

export class CreateLanguageDto {
  @ApiProperty({ title: 'Language title', type: String })
  title: string;

  @ApiProperty({ title: 'Language code', type: String })
  code: string;
}
