import { PaginationRequestDto } from '../../../shared/dto/pagination-request.dto';
import { MyReviewsOrderByEnum } from '../enums/my-reviews-order-by.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, ValidateIf } from 'class-validator';

export class AdministrationReviewsRequestDto extends PaginationRequestDto<MyReviewsOrderByEnum> {
  @ApiProperty({ type: Number, required: true, description: 'Place id' })
  @IsNumber()
  placeId: number;
  @ApiProperty({ type: String, description: 'Search' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  search?: string;
}
