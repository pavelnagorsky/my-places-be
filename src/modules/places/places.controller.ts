import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
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
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  PickType,
} from '@nestjs/swagger';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from '../users/entities/user.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { PlaceDto } from './dto/place.dto';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { Place } from './entities/place.entity';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlaceSlugDto } from './dto/place-slug.dto';
import { ValidationExceptionDto } from '../../shared/validation/validation-exception.dto';
import { SelectPlaceDto } from './dto/select-place.dto';
import { ValidateSlugDto } from './dto/validate-slug.dto';
import { MyPlacesResponseDto } from './dto/my-places-response.dto';
import { MyPlacesRequestDto } from './dto/my-places-request.dto';
import { PlaceEditDto } from './dto/place-edit.dto';
import { ModerationPlacesResponseDto } from './dto/moderation-places-response.dto';
import { ModerationPlacesRequestDto } from './dto/moderation-places-request.dto';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { ModerationDto } from './dto/moderation.dto';
import { MyPlaceDto } from './dto/my-place.dto';
import { ChangePlaceStatusDto } from './dto/change-place-status.dto';
import { UpdateSlugDto } from './dto/update-slug.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @ApiOperation({ summary: 'Create Place' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Place, ['id']),
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
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

  @ApiOperation({ summary: 'Get all places slugs' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceSlugDto,
    isArray: true,
  })
  @UseInterceptors(CacheInterceptor)
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
    type: ValidateSlugDto,
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Post('slugs/validate')
  async checkSlugValidity(@Body() createSlugDto: ValidateSlugDto) {
    const slugExists = await this.placesService.validateSlugExists(
      createSlugDto.slug,
      createSlugDto.id,
    );
    const existsMessage = 'SLUG_EXISTS';
    if (slugExists)
      throw new BadRequestException({
        message: existsMessage,
      });
    return;
  }

  @ApiOperation({ summary: 'Update place slug' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The id of the place',
  })
  @ApiBody({
    type: UpdateSlugDto,
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Put(':id/slug')
  async updatePlaceSlug(
    @Param('id', ParseIntPipe) placeId: number,
    @Body() dto: UpdateSlugDto,
  ) {
    await this.placesService.updatePlaceSlug(placeId, dto.slug);
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
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
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

  @ApiOperation({ summary: 'Get place by slug and language id' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found',
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
  @Get('slug/:slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query('lang', ParseIntPipe) langId: number,
  ) {
    const place = await this.placesService.findOneBySlug(slug, langId);
    return new PlaceDto(place);
  }

  @ApiOperation({ summary: 'Update Place' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Place, ['id']),
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
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
  @ApiBody({
    type: UpdatePlaceDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ) {
    const userIsPlaceAuthor = await this.placesService.checkUserRelation(
      tokenPayload.id,
      id,
    );
    if (!userIsPlaceAuthor)
      throw new ForbiddenException({
        message: 'Forbidden, user is not author',
      });
    return await this.placesService.updatePlace(id, langId, updatePlaceDto);
  }

  @ApiOperation({ summary: 'Update Place by administration' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Place, ['id']),
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
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
  @ApiBody({
    type: UpdatePlaceDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Put(':id/administration')
  async updateByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ) {
    return await this.placesService.updatePlace(
      id,
      langId,
      updatePlaceDto,
      true,
    );
  }

  @ApiOperation({ summary: 'Delete Place' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Place, ['id']),
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the place',
  })
  @Auth()
  @Delete(':id')
  async deletePlace(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
  ) {
    const userIsPlaceAuthor = await this.placesService.checkUserRelation(
      tokenPayload.id,
      id,
    );
    const isAdmin = !!tokenPayload.roles.find(
      (role) => role.name === RoleNamesEnum.ADMIN,
    );
    if (!userIsPlaceAuthor && !isAdmin)
      throw new ForbiddenException({
        message: 'Forbidden, user is not author',
      });
    const data = await this.placesService.removePlace(id);
    return data;
  }

  @ApiOperation({ summary: 'Get my places' })
  @ApiOkResponse({
    description: 'OK',
    type: MyPlacesResponseDto,
  })
  @ApiBody({
    type: MyPlacesRequestDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post('my-places')
  async getMyPlaces(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() dto: MyPlacesRequestDto,
    @TokenPayload()
    tokenPayload: AccessTokenPayloadDto,
  ) {
    const [places, total] = await this.placesService.findMyPlaces(
      langId,
      dto,
      tokenPayload,
    );
    return new MyPlacesResponseDto(places, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Get place short info' })
  @ApiOkResponse({
    description: 'OK',
    type: MyPlaceDto,
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
  @Auth(RoleNamesEnum.ADMIN)
  @Get(':id/administration')
  async getPlaceShortInfo(
    @Query('lang', ParseIntPipe) langId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const place = await this.placesService.getPlaceShortInfo(id, langId);
    if (!place)
      throw new NotFoundException({
        message: 'Place not found',
      });
    return new MyPlaceDto(place);
  }

  @ApiOperation({ summary: 'Get places for administration' })
  @ApiOkResponse({
    description: 'OK',
    type: MyPlacesResponseDto,
  })
  @ApiBody({
    type: MyPlacesRequestDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Post('administration-places')
  async getPlacesForAdministration(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() dto: MyPlacesRequestDto,
  ) {
    const [places, total] = await this.placesService.findMyPlaces(langId, dto);
    return new MyPlacesResponseDto(places, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Get place for editing' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceEditDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The id of the place',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get(':id/edit')
  async getPlaceForEdit(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
  ) {
    const roleNames = tokenPayload.roles.map((r) => r.name);
    if (
      !roleNames.includes(RoleNamesEnum.MODERATOR) ||
      !roleNames.includes(RoleNamesEnum.ADMIN)
    ) {
      const userIsPlaceAuthor = await this.placesService.checkUserRelation(
        tokenPayload.id,
        id,
      );
      if (!userIsPlaceAuthor)
        throw new ForbiddenException({
          message: 'Forbidden, user is not author',
        });
    }
    const place = await this.placesService.getPlaceForEdit(id, langId);
    return new PlaceEditDto(place);
  }

  @ApiOperation({ summary: 'Get place for moderation' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceEditDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The id of the place',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.MODERATOR, RoleNamesEnum.ADMIN)
  @Get(':id/moderation')
  async getPlaceForModeration(@Param('id', ParseIntPipe) id: number) {
    const place = await this.placesService.getPlaceForModeration(id);
    return new PlaceEditDto(place);
  }

  @ApiOperation({ summary: 'Get moderation places' })
  @ApiOkResponse({
    description: 'OK',
    type: ModerationPlacesResponseDto,
  })
  @ApiBody({
    type: ModerationPlacesRequestDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.MODERATOR, RoleNamesEnum.ADMIN)
  @Post('moderation-places')
  async getModerationPlaces(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() dto: ModerationPlacesRequestDto,
  ) {
    const [places, total] = await this.placesService.findModerationPlaces(
      langId,
      dto,
    );
    return new ModerationPlacesResponseDto(places, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Moderate place' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The id of the place',
  })
  @ApiBody({
    type: ModerationDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.MODERATOR, RoleNamesEnum.ADMIN)
  @Post(':id/moderation')
  async moderatePlace(
    @Param('id', ParseIntPipe) placeId: number,
    @Body() dto: ModerationDto,
    @TokenPayload(UserFromTokenPipe) moderator: User,
  ) {
    await this.placesService.moderatePlace(placeId, dto, moderator);
    return;
  }

  @ApiOperation({ summary: 'Change place status' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The id of the place',
  })
  @ApiBody({
    type: ChangePlaceStatusDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Post(':id/administration/change-status')
  async changePlaceStatus(
    @Param('id', ParseIntPipe) placeId: number,
    @Body() dto: ChangePlaceStatusDto,
  ) {
    await this.placesService.changePlaceStatus(placeId, dto);
    return;
  }

  @ApiOperation({ summary: 'Delete place and assign reviews to another place' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The id of the place',
  })
  @ApiQuery({
    name: 'newPlaceId',
    type: Number,
    required: false,
    description: 'The ID of the place where to assign reviews',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Delete(':id/administration/safe-delete')
  async safeDeletePlace(
    @Param('id', ParseIntPipe) placeId: number,
    @Query('newPlaceId') newPlaceId: string | undefined,
  ) {
    await this.placesService.deletePlaceAdministration(
      placeId,
      newPlaceId ? +newPlaceId : undefined,
    );
    return;
  }
}
