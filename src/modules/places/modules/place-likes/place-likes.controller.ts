import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseInterceptors,
} from "@nestjs/common";
import { PlaceLikesService } from "./place-likes.service";
import { Auth } from "../../../auth/decorators/auth.decorator";
import { TokenPayload } from "../../../auth/decorators/token-payload.decorator";
import { AccessTokenPayloadDto } from "../../../auth/dto/access-token-payload.dto";
import { IsLikedDto } from "./dto/is-liked.dto";

@ApiTags("Place likes")
@Controller("/place-likes")
export class PlaceLikesController {
  constructor(private readonly likesService: PlaceLikesService) {}

  @ApiOperation({ summary: "Check if place is liked by user" })
  @ApiOkResponse({
    description: "OK",
    type: IsLikedDto,
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of the place",
  })
  @Auth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get("places/:id")
  async checkPlaceLike(
    @Param("id", ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto
  ) {
    const likeExists = await this.likesService.checkPlaceLikedByUser(
      tokenPayload.id,
      id
    );
    return new IsLikedDto(likeExists);
  }

  @ApiOperation({ summary: "Change place like" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of the place",
  })
  @Auth()
  @Put("places/:id")
  async changeLike(
    @Param("id", ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto
  ) {
    await this.likesService.changePlaceLike(tokenPayload.id, id);
    return;
  }
}
