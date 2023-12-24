import { ApiProperty } from '@nestjs/swagger';
import { MyReviewDto } from './my-review.dto';
import { Review } from '../entities/review.entity';

export class MyReviewsResponseDto {
  @ApiProperty({ type: MyReviewDto, isArray: true })
  data: MyReviewDto[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;

  @ApiProperty({ type: Number })
  lastIndex: number;

  constructor(data: Review[], lastIndex: number, hasMore: boolean) {
    this.data = data.map((r) => new MyReviewDto(r));
    this.lastIndex = lastIndex;
    this.hasMore = hasMore;
  }
}
