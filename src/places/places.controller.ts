import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SearchPlaceDto } from './dto/search-place.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from '../users/entities/user.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { PlaceDto } from './dto/place.dto';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { Token } from '../auth/decorators/token.decorator';
import { PayloadFromTokenPipe } from '../auth/pipes/payload-from-token.pipe';

@ApiTags('Places')
@Controller('/places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @ApiOperation({ summary: 'Create Place' })
  @ApiOkResponse({
    description: 'OK',
    type: SearchPlaceDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiBody({
    type: CreatePlaceDto,
  })
  @Auth()
  @Post()
  async create(
    @Query('lang', ParseIntPipe) langId: number,
    @TokenPayload(UserFromTokenPipe) user: User,
    @Body() createPlaceDto: CreatePlaceDto,
  ) {
    return await this.placesService.create(langId, user, createPlaceDto);
  }

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

  @ApiOperation({ summary: 'Get place by id and language id' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'OK',
    type: PlaceDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the place',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
    @Token(PayloadFromTokenPipe) tokenPayload: TokenPayloadDto | null,
  ) {
    const place = await this.placesService.findOneById(
      id,
      langId,
      tokenPayload,
    );
    return new PlaceDto(place);
  }
}
