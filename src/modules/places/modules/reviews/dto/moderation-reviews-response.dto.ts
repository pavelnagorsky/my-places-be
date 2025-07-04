import { ApiProperty } from "@nestjs/swagger";
import { Review } from "../entities/review.entity";
import { ModerationReviewDto } from "./moderation-review.dto";
import { PaginationResponseDto } from "../../../../../shared/dto/pagination-response.dto";

export class ModerationReviewsResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: ModerationReviewDto, isArray: true })
  items: ModerationReviewDto[];

  constructor(
    data: Review[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    }
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((r) => new ModerationReviewDto(r));
  }
}
