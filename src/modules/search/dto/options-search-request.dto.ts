import { PaginationRequestDto } from '../../../shared/dto/pagination-request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, ValidateIf } from 'class-validator';
import { SearchPlacesOrderByEnum } from '../enums/search-places-order-by.enum';

export class OptionsSearchRequestDto extends PaginationRequestDto<SearchPlacesOrderByEnum> {
  @ApiProperty({ type: String, description: 'Search' })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  search?: string;

  @ApiProperty({
    type: Number,
    isArray: true,
    description: 'Place ids to exclude',
  })
  @IsNumber(undefined, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  excludeIds?: number[];
}
