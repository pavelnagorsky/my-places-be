import { ApiProperty } from '@nestjs/swagger';
import { Place } from '../entities/place.entity';
import { ModerationPlaceDto } from './moderation-place.dto';
import { PaginationResponseDto } from '../../../shared/dto/pagination-response.dto';

export class ModerationPlacesResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: ModerationPlaceDto, isArray: true })
  items: ModerationPlaceDto[];

  constructor(
    data: Place[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    },
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((p) => new ModerationPlaceDto(p));
  }
}
