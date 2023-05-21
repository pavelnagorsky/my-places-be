import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { PlaceCategoriesService } from './place-categories.service';
import { CreatePlaceCategoryDto } from './dto/create-place-category.dto';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PlaceCategoryDto } from './dto/place-category.dto';

@ApiTags('Place categories')
@Controller('placeCategories')
export class PlaceCategoriesController {
  constructor(
    private readonly placeCategoriesService: PlaceCategoriesService,
  ) {}

  @ApiOperation({ summary: 'Create Place category' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceCategoryDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiBody({
    type: CreatePlaceCategoryDto,
  })
  @Post()
  async create(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() createPlaceCategoryDto: CreatePlaceCategoryDto,
  ) {
    return await this.placeCategoriesService.create(
      langId,
      createPlaceCategoryDto,
    );
  }

  @ApiOperation({ summary: 'Get all place categories by language id' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceCategoryDto,
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
  ): Promise<PlaceCategoryDto[]> {
    const placeCategories = await this.placeCategoriesService.findAll(langId);
    return placeCategories.map((pc) => new PlaceCategoryDto(pc));
  }

  @ApiOperation({ summary: 'Get place category by id and language id' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceCategoryDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of Place Category',
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
    const placeCategory = await this.placeCategoriesService.findOne(id, langId);
    return new PlaceCategoryDto(placeCategory);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePlaceCategoryDto: UpdatePlaceCategoryDto,
  // ) {
  //   return this.placeCategoriesService.update(+id, updatePlaceCategoryDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.placeCategoriesService.remove(+id);
  // }
}
