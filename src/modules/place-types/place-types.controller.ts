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
import { PlaceTypesService } from './place-types.service';
import { CreatePlaceTypeDto } from './dto/create-place-type.dto';
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
import { PlaceTypeDto } from './dto/place-type.dto';
import { ValidationExceptionDto } from '../../shared/validation/validation-exception.dto';
import { UpdatePlaceTypeDto } from './dto/update-place-type.dto';
import { PlaceTypeAdminDto } from './dto/place-type-admin.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('Place types')
@Controller('placeTypes')
export class PlaceTypesController {
  constructor(private readonly placeTypesService: PlaceTypesService) {}

  @ApiOperation({ summary: 'ADMIN: Create Place type' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: CreatePlaceTypeDto,
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Post('administration')
  async create(@Body() createPlaceTypeDto: CreatePlaceTypeDto) {
    const placeType = await this.placeTypesService.create(createPlaceTypeDto);
    return { id: placeType.id };
  }

  @ApiOperation({ summary: 'ADMIN: Update Place type' })
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
    description: 'The ID of Place type',
  })
  @ApiBody({
    type: UpdatePlaceTypeDto,
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Put(':id/administration')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlaceTypeDto: UpdatePlaceTypeDto,
  ) {
    const type = await this.placeTypesService.update(id, updatePlaceTypeDto);
    return { id: type.id };
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
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @Get()
  async findAll(
    @Query('lang', ParseIntPipe) langId: number,
  ): Promise<PlaceTypeDto[]> {
    const types = await this.placeTypesService.findAll(langId);
    return types.map((t) => new PlaceTypeDto(t));
  }

  @ApiOperation({ summary: 'ADMIN: Get all place types by language id' })
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
  @Get('administration')
  async findAllAdmin(
    @Query('lang', ParseIntPipe) langId: number,
  ): Promise<PlaceTypeDto[]> {
    const types = await this.placeTypesService.findAll(langId);
    return types.map((t) => new PlaceTypeDto(t));
  }

  @ApiOperation({ summary: 'ADMIN: Get place type by id' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceTypeAdminDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of Place type',
  })
  @Auth(RoleNamesEnum.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/administration')
  async findByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    const placeType = await this.placeTypesService.findOneAdministration(id);
    return new PlaceTypeAdminDto(placeType);
  }

  @ApiOperation({ summary: 'ADMIN: Delete place type by id' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of Place type',
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Delete(':id/administration')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.placeTypesService.remove(id);
  }
}
