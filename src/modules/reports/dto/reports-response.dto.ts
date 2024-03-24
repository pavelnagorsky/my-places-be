import { ApiProperty } from '@nestjs/swagger';
import { Report } from '../entities/report.entity';
import { ReportDto } from './report.dto';
import { PaginationResponseDto } from '../../../shared/dto/pagination-response.dto';

export class ReportsResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: ReportDto, isArray: true })
  items: ReportDto[];

  constructor(
    data: Report[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    },
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((p) => new ReportDto(p));
  }
}
