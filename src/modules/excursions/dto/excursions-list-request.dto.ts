import { PaginationRequestDto } from '../../../shared/dto/pagination-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString, ValidateIf } from 'class-validator';
import { ExcursionsListOrderByEnum } from '../enums/excursions-list-order-by.enum';
import { ExcursionStatusesEnum } from '../enums/excursion-statuses.enum';

export class ExcursionsListRequestDto extends PaginationRequestDto<ExcursionsListOrderByEnum> {
  @ApiProperty({ type: String, description: 'Date from' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateFrom?: string | null;
  @ApiProperty({ type: String, description: 'Date to' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateTo?: string | null;
  @ApiProperty({ type: String, description: 'Search' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  search?: string;
  @ApiProperty({
    enum: ExcursionStatusesEnum,
    isArray: true,
    description: 'Statuses',
  })
  @IsNumber({}, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  statuses?: ExcursionStatusesEnum[];
  @ApiProperty({
    type: Number,
    isArray: true,
    description: 'User IDs',
  })
  @IsNumber({}, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  userIds?: number[];
}
