import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PlaceCategoriesService } from './place-categories.service';
import { CreatePlaceCategoryDto } from './dto/create-place-category.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PlaceCategoryDto } from './dto/place-category.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { PlaceCategoryAdminDto } from './dto/place-category-admin.dto';
import { UpdatePlaceCategoryDto } from './dto/update-place-category.dto';
import { ValidationExceptionDto } from '../../shared/validation/validation-exception.dto';

@ApiTags('Place categories')
@Controller('placeCategories')
export class PlaceCategoriesController {
  constructor(
    private readonly placeCategoriesService: PlaceCategoriesService,
  ) {}

  @ApiOperation({ summary: 'ADMIN: Create Place category' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: CreatePlaceCategoryDto,
  })
  //@Auth(RoleNamesEnum.ADMIN)
  @Post('administration')
  async create(@Body() createPlaceCategoryDto: CreatePlaceCategoryDto) {
    const category = await this.placeCategoriesService.create(
      createPlaceCategoryDto,
    );
    return { id: category.id };
  }

  @ApiOperation({ summary: 'ADMIN: Update Place category' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of Place Category',
  })
  @ApiBody({
    type: UpdatePlaceCategoryDto,
  })
  //@Auth(RoleNamesEnum.ADMIN)
  @Put('administration/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlaceCategoryDto: UpdatePlaceCategoryDto,
  ) {
    const category = await this.placeCategoriesService.update(
      id,
      updatePlaceCategoryDto,
    );
    return { id: category.id };
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

  @ApiOperation({ summary: 'ADMIN: Get place category by id' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceCategoryAdminDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of Place Category',
  })
  //@Auth(RoleNamesEnum.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('administration/:id')
  async findByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    const placeCategory =
      await this.placeCategoriesService.findOneAdministration(id);
    return new PlaceCategoryAdminDto(placeCategory);
  }

  @ApiOperation({ summary: 'ADMIN: Delete place category by id' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of Place Category',
  })
  //@Auth(RoleNamesEnum.ADMIN)
  @Delete('administration/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.placeCategoriesService.remove(id);
  }
}
