import { ApiProperty } from '@nestjs/swagger';
import { CreatePlaceDto } from './create-place.dto';

export class UpdatePlaceDto extends CreatePlaceDto {
  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Should translate again',
  })
  shouldTranslate: boolean;
}
