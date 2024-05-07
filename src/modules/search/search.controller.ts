import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SearchService } from './search.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { PlacesSearchResponseDto } from '../places/dto/places-search-response.dto';
import { ValidationExceptionDto } from '../../shared/validation/validation-exception.dto';
import { SearchRequestDto } from '../places/dto/search-request.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: 'Search places' })
  @ApiOkResponse({
    description: 'OK',
    type: PlacesSearchResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: SearchRequestDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('search')
  async search(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() searchDto: SearchRequestDto,
  ) {
    const [places, total] = await this.searchService.search(langId, searchDto);
    return new PlacesSearchResponseDto(places, {
      requestedPage: searchDto.page,
      pageSize: searchDto.pageSize,
      totalItems: total,
    });
  }
}
