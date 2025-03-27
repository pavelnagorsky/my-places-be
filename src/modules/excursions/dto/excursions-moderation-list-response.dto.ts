import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from '../../../shared/dto/pagination-response.dto';
import { Excursion } from '../entities/excursion.entity';
import { ExcursionsModerationListItemDto } from './excursions-moderation-list-item.dto';

export class ExcursionsModerationListResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: ExcursionsModerationListItemDto, isArray: true })
  items: ExcursionsModerationListItemDto[];

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
      (excursion) => new ExcursionsModerationListItemDto(excursion),
    );
  }
}
