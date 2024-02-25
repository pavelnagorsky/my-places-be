import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString, ValidateIf } from 'class-validator';
import { ReviewStatusesEnum } from '../enums/review-statuses.enum';
import { MyReviewsOrderByEnum } from '../enums/my-reviews-order-by.enum';
import { PaginationRequestDto } from '../../shared/dto/pagination-request.dto';

export class MyReviewsRequestDto extends PaginationRequestDto<MyReviewsOrderByEnum> {
  @ApiProperty({ type: String, description: 'Date from' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateFrom?: string | null;
  @ApiProperty({ type: String, description: 'Date to' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateTo?: string | null;
  @ApiProperty({ type: String, description: 'Search' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  search?: string;
  @ApiProperty({
    enum: ReviewStatusesEnum,
    isArray: true,
    description: 'Statuses',
  })
  @IsNumber({}, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  statuses?: ReviewStatusesEnum[];
}
