import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ModerationReviewsOrderByEnum } from '../enums/moderation-reviews-order-by';

export class ModerationReviewsRequestDto {
  @ApiProperty({ type: Number, description: 'Last pagination index' })
  @IsNumber()
  lastIndex: number;
  @ApiProperty({ type: Number, description: 'Items per page' })
  @IsNumber()
  itemsPerPage: number;
  @ApiProperty({ type: String, description: 'Date from' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateFrom?: string | null;
  @ApiProperty({ type: String, description: 'Date to' })
  @IsDateString()
  @ValidateIf((object, value) => Boolean(value))
  dateTo?: string | null;
  @ApiProperty({ type: String, description: 'Author email' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  authorEmail?: string;
  @ApiProperty({ type: String, description: 'Search' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  search?: string;
  @ApiProperty({ enum: ModerationReviewsOrderByEnum, description: 'Order by' })
  @IsNumber()
  @ValidateIf((object, value) => Boolean(value))
  orderBy?: ModerationReviewsOrderByEnum;
  @ApiProperty({ type: Boolean, description: 'Is order direction ASC' })
  @IsBoolean()
  @ValidateIf((object, value) => Boolean(value))
  orderAsc?: boolean;
}
