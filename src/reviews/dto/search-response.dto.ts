import { ApiProperty } from '@nestjs/swagger';
import { SearchReviewDto } from './search-review.dto';

export class SearchResponseDto {
  @ApiProperty({ type: SearchReviewDto, isArray: true })
  data: SearchReviewDto[];
  @ApiProperty({ type: Boolean })
  hasMore: boolean;
  @ApiProperty({ type: Number })
  totalResults: number;

  constructor(data: SearchReviewDto[], hasMore: boolean, totalResults: number) {
    this.data = data;
    this.hasMore = hasMore;
    this.totalResults = totalResults;
  }
}
