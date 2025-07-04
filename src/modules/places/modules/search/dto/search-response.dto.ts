import { ApiProperty } from "@nestjs/swagger";
import { PaginationResponseDto } from "../../../../../shared/dto/pagination-response.dto";
import { SearchPlaceDto } from "./search-place.dto";
import { Place } from "../../../entities/place.entity";

export class SearchResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: SearchPlaceDto, isArray: true })
  items: SearchPlaceDto[];

  constructor(
    data: Place[],
    languageId: number,
    pagination: {
      requestedPage: number;
      pageSize: number;
      totalItems: number;
    }
  ) {
    super(pagination.requestedPage, pagination.pageSize, pagination.totalItems);
    this.items = data.map((place) => new SearchPlaceDto(place, languageId));
  }
}
