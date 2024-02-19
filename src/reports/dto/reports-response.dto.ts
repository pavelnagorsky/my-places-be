import { ApiProperty } from '@nestjs/swagger';
import { Report } from '../entities/report.entity';
import { ReportDto } from './report.dto';

export class ReportsResponseDto {
  @ApiProperty({ type: ReportDto, isArray: true })
  data: ReportDto[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;

  @ApiProperty({ type: Number })
  lastIndex: number;

  constructor(data: Report[], lastIndex: number, hasMore: boolean) {
    this.data = data.map((p) => new ReportDto(p));
    this.lastIndex = lastIndex;
    this.hasMore = hasMore;
  }
}
