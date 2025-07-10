import { PaginationResponseDto } from "../../../../../shared/dto/pagination-response.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Place } from "../../../entities/place.entity";
import { OptionsSearchDto } from "./options-search.dto";

export class OptionsSearchResponseDto extends PaginationResponseDto {
  @ApiProperty({ type: OptionsSearchDto, isArray: true })
  items: OptionsSearchDto[];

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
    this.items = data.map((p) => new OptionsSearchDto(p, languageId));
  }
}
