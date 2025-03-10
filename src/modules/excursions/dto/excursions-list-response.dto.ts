import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from '../../../shared/dto/pagination-response.dto';
import { ExcursionsListItemDto } from './excursions-list-item.dto';
import { Excursion } from '../entities/excursion.entity';

export class ExcursionsListResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: ExcursionsListItemDto, isArray: true })
  items: ExcursionsListItemDto[];

  constructor(
    data: Excursion[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    },
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((route) => new ExcursionsListItemDto(route));
  }
}
