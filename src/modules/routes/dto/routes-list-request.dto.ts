import { PaginationRequestDto } from '../../../shared/dto/pagination-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, ValidateIf } from 'class-validator';
import { RoutesListOrderByEnum } from '../enums/routes-list-order-by.enum';

export class RoutesListRequestDto extends PaginationRequestDto<RoutesListOrderByEnum> {
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
}
