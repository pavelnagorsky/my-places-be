import { SearchPlaceDto } from './search-place.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SearchResponseDto {
  @ApiProperty({ type: SearchPlaceDto, isArray: true })
  data: SearchPlaceDto[];

  @ApiProperty({ type: Number })
  currentPage: number;
  @ApiProperty({ type: Number })
  totalPages: number;
  @ApiProperty({ type: Number })
  totalResults: number;

  constructor(
    data: SearchPlaceDto[],
    currentPage: number,
    totalPages: number,
    totalResults: number,
  ) {
    this.data = data;
    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.totalResults = totalResults;
  }
}
