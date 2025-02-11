import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateExcursionDto } from './create-excursion.dto';

export class UpdateExcursionDto extends CreateExcursionDto {
  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Should translate again',
  })
  shouldTranslate: boolean;
}
