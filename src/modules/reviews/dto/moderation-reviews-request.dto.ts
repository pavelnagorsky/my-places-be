import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, ValidateIf } from 'class-validator';
import { ModerationReviewsOrderByEnum } from '../enums/moderation-reviews-order-by.enum';
import { PaginationRequestDto } from '../../../shared/dto/pagination-request.dto';

export class ModerationReviewsRequestDto extends PaginationRequestDto<ModerationReviewsOrderByEnum> {
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
}
