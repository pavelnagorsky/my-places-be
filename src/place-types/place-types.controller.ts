import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PlaceTypesService } from './place-types.service';
import { CreatePlaceTypeDto } from './dto/create-place-type.dto';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PlaceTypeDto } from './dto/place-type.dto';

@ApiTags('Place types')
@Controller('placeTypes')
export class PlaceTypesController {
  constructor(private readonly placeTypesService: PlaceTypesService) {}

  @ApiOperation({ summary: 'Create Place type' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceTypeDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiBody({
    type: CreatePlaceTypeDto,
  })
  @Post()
  async create(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() createPlaceTypeDto: CreatePlaceTypeDto,
  ) {
    return await this.placeTypesService.create(langId, createPlaceTypeDto);
  }

  @ApiOperation({ summary: 'Get all place types by language id' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceTypeDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(
    @Query('lang', ParseIntPipe) langId: number,
  ): Promise<PlaceTypeDto[]> {
    const types = await this.placeTypesService.findAll(langId);
    return types.map((t) => new PlaceTypeDto(t));
  }

  @ApiOperation({ summary: 'Get place type by id and language id' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceTypeDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of Place Type',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
  ) {
    const placeType = await this.placeTypesService.findOne(id, langId);
    return new PlaceTypeDto(placeType);
  }

  // @Patch(':id')
  // update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Query('lang', ParseIntPipe) langId: number,
  //   @Body() updatePlaceTypeDto: UpdatePlaceTypeDto,
  // ) {
  //   return this.placeTypesService.update(id, langId, updatePlaceTypeDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.placeTypesService.remove(id);
  // }
}
