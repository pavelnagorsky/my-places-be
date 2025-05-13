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
} from "@nestjs/common";
import { ExcursionsService } from "./excursions.service";
import { CreateExcursionDto } from "./dto/create-excursion.dto";
import { UpdateExcursionDto } from "./dto/update-excursion.dto";
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
} from "@nestjs/swagger";
import { ValidationExceptionDto } from "../../shared/validation/validation-exception.dto";
import { Auth } from "../auth/decorators/auth.decorator";
import { Excursion } from "./entities/excursion.entity";
import { TokenPayload } from "../auth/decorators/token-payload.decorator";
import { UserFromTokenPipe } from "../auth/pipes/user-from-token.pipe";
import { User } from "../users/entities/user.entity";
import { RoleNamesEnum } from "../roles/enums/role-names.enum";
import { AccessTokenPayloadDto } from "../auth/dto/access-token-payload.dto";
import { ExcursionsListRequestDto } from "./dto/excursions-list-request.dto";
import { ExcursionsListResponseDto } from "./dto/excursions-list-response.dto";
import { ExcursionDto } from "./dto/excursion.dto";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { ExcursionSlugDto } from "./dto/excursion-slug.dto";
import { ExcursionsModerationListResponseDto } from "./dto/excursions-moderation-list-response.dto";
import { ExcursionsModerationListRequestDto } from "./dto/excursions-moderation-list-request.dto";
import { ModerationDto } from "../places/dto/moderation.dto";
import { UpdateSlugDto } from "./dto/update-slug.dto";
import { ValidateSlugDto } from "./dto/validate-slug.dto";
import { ChangeExcursionStatusDto } from "./dto/change-excursion-status.dto";
import { ExcursionsSearchResponseDto } from "./dto/excursions-search-response.dto";
import { ExcursionsSearchRequestDto } from "./dto/excursions-search-request.dto";

@ApiTags("Excursions")
@Controller("excursions")
export class ExcursionsController {
  constructor(private readonly excursionsService: ExcursionsService) {}

  @ApiOperation({ summary: "Create Excursion" })
  @ApiOkResponse({
    description: "OK",
    type: PickType(Excursion, ["id"]),
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationExceptionDto,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @ApiBody({
    type: CreateExcursionDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post()
  async create(
    @Query("lang", ParseIntPipe) langId: number,
    @Body() createExcursionDto: CreateExcursionDto,
    @TokenPayload(UserFromTokenPipe) user: User
  ) {
    return await this.excursionsService.create(
      createExcursionDto,
      langId,
      user
    );
  }

  @ApiOperation({ summary: "Find my excursions" })
  @ApiOkResponse({
    description: "OK",
    type: ExcursionsListResponseDto,
  })
  @ApiBody({
    type: ExcursionsListRequestDto,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post("personal-list")
  async findMyExcursions(
    @Query("lang", ParseIntPipe) langId: number,
    @Body() dto: ExcursionsListRequestDto,
    @TokenPayload()
    tokenPayload: AccessTokenPayloadDto
  ) {
    const [excursions, total] = await this.excursionsService.findExcursions(
      dto,
      langId,
      tokenPayload.id
    );

    return new ExcursionsListResponseDto(excursions, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: "Find excursions for administration" })
  @ApiOkResponse({
    description: "OK",
    type: ExcursionsListResponseDto,
  })
  @ApiBody({
    type: ExcursionsListRequestDto,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Post("administration-list")
  async findAdministrationExcursions(
    @Query("lang", ParseIntPipe) langId: number,
    @Body() dto: ExcursionsListRequestDto
  ) {
    const [excursions, total] = await this.excursionsService.findExcursions(
      dto,
      langId
    );

    return new ExcursionsListResponseDto(excursions, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: "Search excursions" })
  @ApiOkResponse({
    description: "OK",
    type: ExcursionsSearchResponseDto,
  })
  @ApiBody({
    type: ExcursionsSearchRequestDto,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post("search")
  async searchExcursions(
    @Query("lang", ParseIntPipe) langId: number,
    @Body() dto: ExcursionsSearchRequestDto
  ) {
    const [excursions, total] = await this.excursionsService.searchExcursions(
      dto,
      langId
    );

    return new ExcursionsSearchResponseDto(excursions, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: "Get excursion by slug and language id" })
  @ApiOkResponse({
    description: "OK",
    type: ExcursionDto,
  })
  @ApiNotFoundResponse({
    description: "Not found",
  })
  @ApiParam({
    name: "slug",
    type: String,
    description: "The slug of the excursion",
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get("slug/:slug")
  async findOneBySlug(
    @Param("slug") slug: string,
    @Query("lang", ParseIntPipe) langId: number
  ) {
    const excursion = await this.excursionsService.findOne(slug, langId);
    if (!excursion)
      throw new NotFoundException({ message: "Excursion not found" });
    this.excursionsService.addView(excursion.id);
    return new ExcursionDto(excursion);
  }

  @ApiOperation({ summary: "Get excursions slugs" })
  @ApiOkResponse({
    description: "OK",
    type: ExcursionSlugDto,
    isArray: true,
  })
  @UseInterceptors(CacheInterceptor)
  @Get("slugs")
  async getSlugs() {
    const slugs = await this.excursionsService.getSlugs();
    return slugs;
  }

  @ApiOperation({ summary: "Get excursion by id and language id" })
  @ApiOkResponse({
    description: "OK",
    type: ExcursionDto,
  })
  @ApiNotFoundResponse({
    description: "Not found",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of the excursion",
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(":id")
  async findOneById(
    @Param("id", ParseIntPipe) id: number,
    @Query("lang", ParseIntPipe) langId: number
  ) {
    const excursion = await this.excursionsService.findOne(id, langId);
    if (!excursion)
      throw new NotFoundException({ message: "Excursion not found" });
    return new ExcursionDto(excursion);
  }

  @ApiOperation({ summary: "Validate excursion slug" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: ValidateSlugDto,
  })
  @Post("slugs/validate")
  async checkSlugValidity(@Body() createSlugDto: ValidateSlugDto) {
    const slugExists = await this.excursionsService.validateSlugExists(
      createSlugDto.slug,
      createSlugDto.id
    );
    const existsMessage = "SLUG_EXISTS";
    if (slugExists)
      throw new BadRequestException({
        message: existsMessage,
      });
    return;
  }

  @ApiOperation({ summary: "Update Excursion" })
  @ApiOkResponse({
    description: "OK",
    type: PickType(Excursion, ["id"]),
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationExceptionDto,
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of the excursion",
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @ApiBody({
    type: UpdateExcursionDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Put(":id")
  async update(
    @Query("lang", ParseIntPipe) langId: number,
    @Param("id", ParseIntPipe) id: number,
    @TokenPayload() tokenDto: AccessTokenPayloadDto,
    @Body() updateExcursionDto: UpdateExcursionDto
  ) {
    const isAdmin = tokenDto.roles
      .map((r) => r.name)
      .includes(RoleNamesEnum.ADMIN);
    return await this.excursionsService.update(
      id,
      updateExcursionDto,
      langId,
      isAdmin
    );
  }

  @ApiOperation({ summary: "Get excursions for moderation" })
  @ApiOkResponse({
    description: "OK",
    type: ExcursionsModerationListResponseDto,
  })
  @ApiBody({
    type: ExcursionsModerationListRequestDto,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.MODERATOR, RoleNamesEnum.ADMIN)
  @Post("moderation-list")
  async getExcursionsForModeration(
    @Query("lang", ParseIntPipe) langId: number,
    @Body() dto: ExcursionsModerationListRequestDto
  ) {
    const [excursions, total] =
      await this.excursionsService.findModerationExcursions(dto, langId);
    return new ExcursionsModerationListResponseDto(excursions, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: "Update excursion primary place" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The id of the excursion",
  })
  @ApiParam({
    name: "placeId",
    type: Number,
    description: "The id of the excursion place",
  })
  @Auth(RoleNamesEnum.MODERATOR, RoleNamesEnum.ADMIN)
  @Put(":id/places/:placeId/set-primary")
  async updateExcursionPrimaryPlace(
    @Param("id", ParseIntPipe) id: number,
    @Param("placeId", ParseIntPipe) excursionPlaceId: number
  ) {
    return await this.excursionsService.setExcursionPrimaryPlace(
      id,
      excursionPlaceId
    );
  }

  @ApiOperation({ summary: "Moderate excursion" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The id of the excursion",
  })
  @ApiBody({
    type: ModerationDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.MODERATOR, RoleNamesEnum.ADMIN)
  @Post(":id/moderation")
  async moderateExcursion(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ModerationDto,
    @TokenPayload(UserFromTokenPipe) moderator: User
  ) {
    await this.excursionsService.moderateExcursion(id, dto, moderator);
    return;
  }

  @ApiOperation({ summary: "Delete excursion" })
  @ApiOkResponse({
    description: "OK",
    type: PickType(Excursion, ["id"]),
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of the excursion",
  })
  @Auth()
  @Delete(":id")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto
  ) {
    const userIsAuthor = await this.excursionsService.checkUserRelation(
      tokenPayload.id,
      id
    );
    const isAdmin = !!tokenPayload.roles.find(
      (role) => role.name === RoleNamesEnum.ADMIN
    );
    if (!userIsAuthor && !isAdmin)
      throw new ForbiddenException({
        message: "Forbidden, user is not author",
      });
    const data = await this.excursionsService.remove(id);
    return data;
  }

  @ApiOperation({ summary: "Update excursion slug" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationExceptionDto,
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The id of the excursion",
  })
  @ApiBody({
    type: UpdateSlugDto,
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Put(":id/slug")
  async updateSlug(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateSlugDto
  ) {
    await this.excursionsService.updateSlug(id, dto.slug);
    return;
  }

  @ApiOperation({ summary: "Change excursion status" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The id of the excursion",
  })
  @ApiBody({
    type: ChangeExcursionStatusDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Post(":id/change-status")
  async changeStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ChangeExcursionStatusDto
  ) {
    await this.excursionsService.changeStatus(id, dto);
    return;
  }
}
