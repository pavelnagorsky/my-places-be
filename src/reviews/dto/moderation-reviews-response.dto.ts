import { ApiProperty } from '@nestjs/swagger';
import { Review } from '../entities/review.entity';
import { ModerationReviewDto } from './moderation-review.dto';

export class ModerationReviewsResponseDto {
  @ApiProperty({ type: ModerationReviewDto, isArray: true })
  data: ModerationReviewDto[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;

  @ApiProperty({ type: Number })
  lastIndex: number;

  constructor(data: Review[], lastIndex: number, hasMore: boolean) {
    this.data = data.map((r) => new ModerationReviewDto(r));
    this.lastIndex = lastIndex;
    this.hasMore = hasMore;
  }
}
