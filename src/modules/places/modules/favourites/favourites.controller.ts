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
  Body,
  Put,
} from "@nestjs/common";
import { FavouritesService } from "./favourites.service";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  PickType,
} from "@nestjs/swagger";
import { Auth } from "../../../auth/decorators/auth.decorator";
import { FavouriteDto } from "./dto/favourite.dto";
import { TokenPayload } from "../../../auth/decorators/token-payload.decorator";
import { AccessTokenPayloadDto } from "../../../auth/dto/access-token-payload.dto";
import { FavouritesRequestDto } from "./dto/favourites-request.dto";
import { UpdateIsActualDto } from "./dto/update-is-actual.dto";

@ApiTags("Favourites")
@Controller("favourites")
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @ApiOperation({ summary: "Create favourite" })
  @ApiOkResponse({
    description: "OK",
    type: PickType(FavouriteDto, ["id"]),
  })
  @ApiParam({
    name: "placeId",
    type: Number,
    description: "The id of the place",
  })
  @Auth()
  @Post(":placeId/add")
  async create(
    @Param("placeId", ParseIntPipe) placeId: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto
  ) {
    const fav = await this.favouritesService.create(tokenPayload.id, placeId);
    return { id: fav.id };
  }

  @ApiOperation({ summary: "Get my favourites" })
  @ApiOkResponse({
    description: "OK",
    type: FavouriteDto,
    isArray: true,
  })
  @ApiBody({
    type: FavouritesRequestDto,
  })
  @ApiQuery({
    name: "lang",
    type: Number,
    description: "The ID of the language",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post()
  async findAll(
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
    @Body() dto: FavouritesRequestDto,
    @Query("lang", ParseIntPipe) langId: number
  ) {
    const favs = await this.favouritesService.findAllByUser(
      tokenPayload.id,
      dto,
      langId
    );
    return favs.map((f) => new FavouriteDto(f));
  }

  @ApiOperation({ summary: "Update my favourite" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Favourite id",
  })
  @ApiBody({
    type: UpdateIsActualDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateIsActualDto,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto
  ) {
    return await this.favouritesService.updateIsActual(
      id,
      dto,
      tokenPayload.id
    );
  }

  @ApiOperation({ summary: "Delete my favourite" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Favourite id",
  })
  @Auth()
  @Delete(":id")
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto
  ) {
    return await this.favouritesService.remove(id, tokenPayload.id);
  }
}
