import { ApiProperty } from '@nestjs/swagger';
import { MyReviewDto } from './my-review.dto';
import { Review } from '../entities/review.entity';
import { PaginationResponseDto } from '../../../shared/dto/pagination-response.dto';

export class MyReviewsResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: MyReviewDto, isArray: true })
  items: MyReviewDto[];

  constructor(
    data: Review[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    },
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((r) => new MyReviewDto(r));
  }
}
