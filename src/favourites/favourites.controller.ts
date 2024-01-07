import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  PickType,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { FavouriteDto } from './dto/favourite.dto';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';

@ApiTags('Favourites')
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @ApiOperation({ summary: 'Create favourite' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(FavouriteDto, ['id']),
  })
  @ApiParam({
    name: 'placeId',
    type: Number,
    description: 'The id of the place',
  })
  @Auth()
  @Post('places/:placeId')
  async create(
    @Param('placeId', ParseIntPipe) placeId: number,
    @TokenPayload() tokenPayload: TokenPayloadDto,
  ) {
    const fav = await this.favouritesService.create(tokenPayload.id, placeId);
    return { id: fav.id };
  }

  @ApiOperation({ summary: 'Get my favourites' })
  @ApiOkResponse({
    description: 'OK',
    type: FavouriteDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get()
  async findAll(
    @TokenPayload() tokenPayload: TokenPayloadDto,
    @Query('lang', ParseIntPipe) langId: number,
  ) {
    const favs = await this.favouritesService.findAllByUser(
      tokenPayload.id,
      langId,
    );
    return favs.map((f) => new FavouriteDto(f));
  }

  @ApiOperation({ summary: 'Update my favourite' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Favourite id',
  })
  @Auth()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: TokenPayloadDto,
  ) {
    return await this.favouritesService.updateIsActual(id, tokenPayload.id);
  }

  @ApiOperation({ summary: 'Delete my favourite' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Favourite id',
  })
  @Auth()
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: TokenPayloadDto,
  ) {
    return await this.favouritesService.remove(id, tokenPayload.id);
  }
}
