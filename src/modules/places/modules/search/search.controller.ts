import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { SearchService } from "./search.service";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ValidationExceptionDto } from "../../../../shared/validation/validation-exception.dto";
import { SearchResponseDto } from "./dto/search-response.dto";
import { SearchRequestDto } from "./dto/search-request.dto";
import { SearchPlaceDto } from "./dto/search-place.dto";
import { OptionsSearchResponseDto } from "./dto/options-search-response.dto";
import { OptionsSearchRequestDto } from "./dto/options-search-request.dto";
import { PlacesCountByTypesDto } from "./dto/places-count-by-types.dto";
import { SearchNearRouteRequestDto } from "./dto/search-near-route-request.dto";

@ApiTags("Search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: "Search places" })
  @ApiOkResponse({
    description: "OK",
    type: SearchResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: SearchRequestDto,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async search(
    @Query("lang", ParseIntPipe) langId: number,
    @Body() searchDto: SearchRequestDto
  ) {
    const [places, total] = await this.searchService.search(searchDto, langId);
    return new SearchResponseDto(places, langId, {
      requestedPage: searchDto.page,
      pageSize: searchDto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: "Search places near route" })
  @ApiOkResponse({
    description: "OK",
    type: SearchResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: SearchNearRouteRequestDto,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post("route")
  async searchNearRoute(
    @Query("lang", ParseIntPipe) langId: number,
    @Body() searchDto: SearchNearRouteRequestDto
  ) {
    const [places, total] = await this.searchService.searchNearRoute(
      searchDto,
      langId
    );
    return new SearchResponseDto(places, langId, {
      requestedPage: searchDto.page,
      pageSize: searchDto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: "Get places by ids" })
  @ApiOkResponse({
    description: "OK",
    type: SearchPlaceDto,
    isArray: true,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @ApiQuery({
    name: "ids",
    type: Number,
    isArray: true,
    description: "Array of ids",
    example: { value: [1, 2, 3], description: "Multiple IDs" },
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get("ids")
  async searchByIds(
    @Query("lang", ParseIntPipe) langId: number,
    @Query(
      "ids",
      new ParseArrayPipe({
        items: Number,
        separator: ",",
      })
    )
    ids: number[]
  ) {
    const places = await this.searchService.searchPlacesByIds(ids);
    return places.map((place) => new SearchPlaceDto(place, langId));
  }

  @ApiOperation({ summary: "Get places options" })
  @ApiOkResponse({
    description: "OK",
    type: OptionsSearchResponseDto,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post("options")
  async searchOptions(
    @Query("lang", ParseIntPipe) langId: number,
    @Body() dto: OptionsSearchRequestDto
  ) {
    const [places, total] = await this.searchService.searchPlaceOptions(
      dto,
      langId
    );
    return new OptionsSearchResponseDto(places, langId, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: "Get places count by popular types" })
  @ApiOkResponse({
    description: "OK",
    type: PlacesCountByTypesDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get("places-count")
  async getPlacesCountByTypes() {
    const data = await this.searchService.getPlacesCountByTypes();
    return new PlacesCountByTypesDto(data);
  }
}
