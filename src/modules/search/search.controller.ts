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
  ApiTags,
} from '@nestjs/swagger';
import { ValidationExceptionDto } from '../../shared/validation/validation-exception.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { SearchRequestDto } from './dto/search-request.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: 'Search places' })
  @ApiOkResponse({
    description: 'OK',
    type: SearchResponseDto,
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
  @Post()
  async search(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() searchDto: SearchRequestDto,
  ) {
    const [places, total] = await this.searchService.search(searchDto, langId);
    return new SearchResponseDto(places, langId, {
      requestedPage: searchDto.page,
      pageSize: searchDto.pageSize,
      totalItems: total,
    });
  }
}
