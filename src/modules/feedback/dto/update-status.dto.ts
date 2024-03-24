import { ApiProperty } from '@nestjs/swagger';
import { CrmStatusesEnum } from '../../../shared/enums/crm-statuses.enum';
import { IsEnum } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    enum: CrmStatusesEnum,
    description: 'status',
  })
  @IsEnum(CrmStatusesEnum)
  status: CrmStatusesEnum;
}
