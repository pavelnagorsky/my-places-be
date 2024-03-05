import { PaginationResponseDto } from '../../shared/dto/pagination-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { FeedbackDto } from './feedback.dto';
import { Feedback } from '../entities/feedback.entity';

export class FeedbackListResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: FeedbackDto, isArray: true })
  items: FeedbackDto[];

  constructor(
    data: Feedback[],
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    },
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((f) => new FeedbackDto(f));
  }
}
