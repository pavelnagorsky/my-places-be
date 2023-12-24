import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, ValidateIf } from 'class-validator';
import { ReviewStatusesEnum } from '../enums/review-statuses.enum';
import { MyReviewsOrderByEnum } from '../enums/my-reviews-order-by.enum';

export class MyReviewsRequestDto {
  @ApiProperty({ type: Number, description: 'Last pagination index' })
  @IsNumber()
  lastIndex: number;
  @ApiProperty({ type: Number, description: 'Items per page' })
  @IsNumber()
  itemsPerPage: number;
  @ApiProperty({ type: String, description: 'Date from' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  dateFrom?: string | null;
  @ApiProperty({ type: String, description: 'Date to' })
  @IsString()
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
  @ApiProperty({ enum: MyReviewsOrderByEnum, description: 'Order by' })
  @IsNumber()
  @ValidateIf((object, value) => Boolean(value))
  orderBy?: MyReviewsOrderByEnum;
  @ApiProperty({ type: Boolean, description: 'Is order direction ASC' })
  @IsBoolean()
  @ValidateIf((object, value) => Boolean(value))
  orderAsc?: boolean;
}
