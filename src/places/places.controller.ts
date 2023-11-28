import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  PickType,
} from '@nestjs/swagger';
import { SearchPlaceDto } from './dto/search-place.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from '../users/entities/user.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { PlaceDto } from './dto/place.dto';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { Place } from './entities/place.entity';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlaceSlugDto } from './dto/place-slug.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { SearchRequestDto } from './dto/search-request.dto';
import { ValidationExceptionDto } from '../shared/validation/validation-exception.dto';
import { SelectPlaceDto } from './dto/select-place.dto';
import { CreateSlugDto } from './dto/create-slug.dto';

@ApiTags('Places')
@Controller('/places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  // @ApiOperation({ summary: 'Create Place' })
  // @ApiOkResponse({
  //   description: 'OK',
  //   type: PickType(Place, ['id']),
  // })
  // @ApiBadRequestResponse({
  //   description: 'Validation failed',
  //   type: ValidationExceptionDto,
  // })
  // @ApiQuery({
  //   name: 'lang',
  //   type: Number,
  //   description: 'The ID of the language',
  // })
  // @ApiBody({
  //   type: CreatePlaceDto,
  // })
  // @Auth()
  // @Post()
  // async create(
  //   @Query('lang', ParseIntPipe) langId: number,
  //   @TokenPayload(UserFromTokenPipe) user: User,
  //   @Body() createPlaceDto: CreatePlaceDto,
  // ) {
  //   return await this.placesService.create(langId, user, createPlaceDto);
  // }

  @ApiOperation({ summary: 'Get all places by language id' })
  @ApiOkResponse({
    description: 'OK',
    type: SearchPlaceDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAll(@Query('lang', ParseIntPipe) langId: number) {
    const places = await this.placesService.findAll(langId);
    return places.map((p) => new SearchPlaceDto(p));
  }

  @ApiOperation({ summary: 'Get all places slugs' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceSlugDto,
    isArray: true,
  })
  @Get('slugs')
  async getPlacesSlugs() {
    const slugs = await this.placesService.getPlacesSlugs();
    return slugs;
  }

  @ApiOperation({ summary: 'Validate place slug' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: CreateSlugDto,
  })
  @Post('slugs/validate')
  async checkSlugValidity(@Body() createSlugDto: CreateSlugDto) {
    const slugExists = await this.placesService.validateSlug(createSlugDto);
    if (slugExists)
      throw new BadRequestException({
        message: 'slug already exists',
      });
    return;
  }

  @ApiOperation({ summary: 'Get places select' })
  @ApiOkResponse({
    description: 'OK',
    type: SelectPlaceDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Search query by place title',
  })
  @ApiQuery({
    name: 'placeId',
    type: String,
    required: false,
    description: 'Search query by place id',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get('select')
  async getPlacesSelect(
    @TokenPayload() tokenPayload: TokenPayloadDto,
    @Query('lang', ParseIntPipe) langId: number,
    @Query('search') search?: string,
    @Query('placeId') placeId?: string,
  ) {
    const parsedPlaceId = typeof placeId === 'string' ? +placeId : null;
    const places = await this.placesService.getPlacesSelect(
      tokenPayload,
      langId,
      search?.trim ? search.trim() : '',
      parsedPlaceId,
    );
    return places.map((p) => new SelectPlaceDto(p));
  }

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
  @Post('search')
  async search(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() searchDto: SearchRequestDto,
  ): Promise<SearchResponseDto> {
    const result = await this.placesService.search(langId, searchDto);
    const mappedPlaces = result.places.map((p) => new SearchPlaceDto(p));
    const response = new SearchResponseDto(
      mappedPlaces,
      result.currentPage,
      result.totalPages,
      result.totalResults,
    );
    return response;
  }

  @ApiOperation({ summary: 'Get place by slug and language id' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'OK',
    type: PlaceDto,
  })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'The slug of the place',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':slug')
  async getById(
    @Param('slug') slug: string,
    @Query('lang', ParseIntPipe) langId: number,
  ) {
    const place = await this.placesService.findOneBySlug(slug, langId);
    return new PlaceDto(place);
  }

  // @ApiOperation({ summary: 'Update Place' })
  // @ApiOkResponse({
  //   description: 'OK',
  //   type: PickType(Place, ['id']),
  // })
  // @ApiBadRequestResponse({
  //   description: 'Validation failed',
  //   type: ValidationExceptionDto,
  // })
  // @ApiParam({
  //   name: 'id',
  //   type: Number,
  //   description: 'The ID of the place',
  // })
  // @ApiQuery({
  //   name: 'lang',
  //   type: Number,
  //   description: 'The ID of the language',
  // })
  // @ApiBody({
  //   type: UpdatePlaceDto,
  // })
  // @Auth()
  // @Put(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Query('lang', ParseIntPipe) langId: number,
  //   @TokenPayload() tokenPayload: TokenPayloadDto,
  //   @Body() updatePlaceDto: UpdatePlaceDto,
  // ) {
  //   const userIsPlaceAuthor = await this.placesService.checkUserRelation(
  //     tokenPayload.id,
  //     id,
  //   );
  //   if (!userIsPlaceAuthor)
  //     throw new ForbiddenException({
  //       message: 'Forbidden, user is not author',
  //     });
  //   return await this.placesService.updatePlace(id, langId, updatePlaceDto);
  // }
}
