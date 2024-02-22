import { CrmStatusesEnum } from '../../shared/enums/crm-statuses.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class ChangeStatusDto {
  @ApiProperty({ description: 'new status', enum: CrmStatusesEnum })
  @IsEnum(CrmStatusesEnum)
  status: CrmStatusesEnum;
}
