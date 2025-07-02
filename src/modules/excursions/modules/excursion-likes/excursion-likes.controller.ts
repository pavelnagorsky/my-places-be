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
import { ExcursionLikesService } from "./excursion-likes.service";
import { Auth } from "../../../auth/decorators/auth.decorator";
import { TokenPayload } from "../../../auth/decorators/token-payload.decorator";
import { AccessTokenPayloadDto } from "../../../auth/dto/access-token-payload.dto";
import { IsLikedDto } from "../../../places/modules/place-likes/dto/is-liked.dto";

@ApiTags("Excursion likes")
@Controller("/excursion-likes")
export class ExcursionLikesController {
  constructor(private readonly likesService: ExcursionLikesService) {}

  @ApiOperation({ summary: "Check if excursion is liked by user" })
  @ApiOkResponse({
    description: "OK",
    type: IsLikedDto,
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of the excursion",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get("excursions/:id")
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

  @ApiOperation({ summary: "Change excursion like" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of the excursion",
  })
  @Auth()
  @Put("excursions/:id")
  async changeLike(
    @Param("id", ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto
  ) {
    return await this.likesService.changeExcursionLike(tokenPayload.id, id);
  }
}
