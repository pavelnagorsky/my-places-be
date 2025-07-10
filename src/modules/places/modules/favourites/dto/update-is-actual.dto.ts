import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateIsActualDto {
  @ApiProperty({
    title: 'Is actual',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  isActual: boolean;
}
