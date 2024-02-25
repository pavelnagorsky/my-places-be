import { ApiProperty } from '@nestjs/swagger';
import { SearchReviewDto } from './search-review.dto';
import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';
import { Review } from '../entities/review.entity';

export class ReviewsSearchResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: SearchReviewDto, isArray: true })
  items: SearchReviewDto[];

  constructor(
    data: Review[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    },
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((r) => new SearchReviewDto(r));
  }
}
