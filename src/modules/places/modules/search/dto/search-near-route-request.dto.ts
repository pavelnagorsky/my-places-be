import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, ValidateIf } from "class-validator";
import { PaginationRequestDto } from "../../../../../shared/dto/pagination-request.dto";
import { SearchPlacesOrderByEnum } from "../enums/search-places-order-by.enum";
import { CoordinatesDto } from "../../../dto/coordinates.dto";

export class SearchNearRouteRequestDto extends PaginationRequestDto<SearchPlacesOrderByEnum> {
  @ApiProperty({ description: "search radius (km)", type: Number })
  @IsNumber()
  radius: number;

  @ApiProperty({
    description: "route coordinates",
    type: CoordinatesDto,
  })
  coordinates: CoordinatesDto[];

  @ApiProperty({
    type: Number,
    isArray: true,
    description: "Place ids to exclude",
  })
  @IsNumber(undefined, { each: true })
  @ValidateIf((object, value) => Boolean(value))
  excludeIds?: number[];
}
