import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CrmStatusesEnum } from '../../shared/enums/crm-statuses.enum';
import { ReportsOrderByEnum } from '../enums/reports-order-by.enum';

export class ReportsRequestDto {
  @ApiProperty({ type: Number, description: 'Last pagination index' })
  @IsNumber()
  lastIndex: number;
  @ApiProperty({ type: Number, description: 'Items per page' })
  @IsNumber()
  itemsPerPage: number;
  @ApiProperty({ type: String, description: 'Created At date from' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateFrom?: string | null;
  @ApiProperty({ type: String, description: 'Created At date to' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateTo?: string | null;
  @ApiProperty({ type: String, description: 'Search' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  search?: string;
  @ApiProperty({
    enum: CrmStatusesEnum,
    isArray: true,
    description: 'statuses',
  })
  @IsNumber({}, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  statuses?: CrmStatusesEnum[];
  @ApiProperty({ enum: ReportsOrderByEnum, description: 'Order by' })
  @IsNumber()
  @ValidateIf((object, value) => Boolean(value))
  orderBy?: ReportsOrderByEnum;
  @ApiProperty({ type: Boolean, description: 'Is order direction ASC' })
  @IsBoolean()
  @ValidateIf((object, value) => Boolean(value))
  orderAsc?: boolean;
}
