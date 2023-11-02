import { ApiProperty } from '@nestjs/swagger';
import { ReviewDto } from '../../reviews/dto/review.dto';

export class SearchResponseDto {
  @ApiProperty({ type: ReviewDto, isArray: true })
  data: ReviewDto[];
  @ApiProperty({ type: Boolean })
  hasMore: boolean;
  @ApiProperty({ type: Number })
  totalResults: number;

  constructor(data: ReviewDto[], hasMore: boolean, totalResults: number) {
    this.data = data;
    this.hasMore = hasMore;
    this.totalResults = totalResults;
  }
}
