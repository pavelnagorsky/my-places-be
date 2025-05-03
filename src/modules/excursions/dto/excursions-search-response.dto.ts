import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from '../../../shared/dto/pagination-response.dto';
import { Excursion } from '../entities/excursion.entity';
import { ExcursionsSearchItemDto } from './excursions-search-item.dto';

export class ExcursionsSearchResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: ExcursionsSearchItemDto, isArray: true })
  items: ExcursionsSearchItemDto[];

  constructor(
    data: Excursion[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    },
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map(
      (excursion) => new ExcursionsSearchItemDto(excursion),
    );
  }
}
