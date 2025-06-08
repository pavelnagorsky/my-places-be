import { PaginationRequestDto } from "../../../shared/dto/pagination-request.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString, ValidateIf } from "class-validator";
import { ExcursionsSearchOrderByEnum } from "../enums/excursions-search-order-by.enum";
import { ExcursionTypesEnum } from "../enums/excursion-types.enum";
import { TravelModesEnum } from "../../routes/enums/travel-modes.enum";

export class ExcursionsSearchRequestDto extends PaginationRequestDto<ExcursionsSearchOrderByEnum> {
  @ApiProperty({
    enum: ExcursionTypesEnum,
    description: "Excursion types",
    isArray: true,
  })
  @IsEnum(ExcursionTypesEnum, { each: true })
  @ValidateIf((object, value) => typeof value !== "undefined")
  types?: ExcursionTypesEnum[];
  @ApiProperty({
    enum: TravelModesEnum,
    description: "Travel modes",
    isArray: true,
  })
  @IsEnum(TravelModesEnum, { each: true })
  @ValidateIf((object, value) => typeof value !== "undefined")
  travelModes?: TravelModesEnum[];
  @ApiProperty({ type: String, description: "Search" })
  @IsString()
  @ValidateIf((object, value) => Boolean(value))
  search?: string;
  @ApiProperty({
    type: Number,
    description: "Region IDs",
    isArray: true,
  })
  @IsNumber(undefined, { each: true })
  @ValidateIf((object, value) => typeof value !== "undefined")
  regionIds?: number[];
  @ApiProperty({
    type: Number,
    description: "Place type IDs",
    isArray: true,
  })
  @IsNumber(undefined, { each: true })
  @ValidateIf((object, value) => typeof value !== "undefined")
  placeTypeIds?: number[];
}
