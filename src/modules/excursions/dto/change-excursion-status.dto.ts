import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ExcursionStatusesEnum } from '../enums/excursion-statuses.enum';

export class ChangeExcursionStatusDto {
  @ApiProperty({
    enum: ExcursionStatusesEnum,
    description: 'Excursion status',
    required: true,
  })
  @IsEnum(ExcursionStatusesEnum)
  status: ExcursionStatusesEnum;

  @ApiProperty({
    type: String,
    description: 'message to user',
  })
  message?: string;
}
