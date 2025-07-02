import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from "@nestjs/common";
import { ExcursionCommentsService } from "./excursion-comments.service";
import { Token } from "../../../auth/decorators/token.decorator";
import { PayloadFromTokenPipe } from "../../../auth/pipes/payload-from-token.pipe";
import { AccessTokenPayloadDto } from "../../../auth/dto/access-token-payload.dto";
import { ValidationExceptionDto } from "../../../../shared/validation/validation-exception.dto";
import { Auth } from "../../../auth/decorators/auth.decorator";
import { TokenPayload } from "../../../auth/decorators/token-payload.decorator";
import { RoleNamesEnum } from "../../../roles/enums/role-names.enum";
import { CommentDto } from "../../../places/modules/place-comments/dto/comment.dto";
import { CreateCommentDto } from "../../../places/modules/place-comments/dto/create-comment.dto";
import { UpdateCommentDto } from "../../../places/modules/place-comments/dto/update-comment.dto";

@ApiTags("Excursion comments")
@Controller("/excursion-comments")
export class ExcursionCommentsController {
  constructor(private readonly commentsService: ExcursionCommentsService) {}

  @ApiOperation({ summary: "Get excursion comments" })
  @ApiOkResponse({
    description: "OK",
    type: CommentDto,
    isArray: true,
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of the excursion",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get("excursions/:id")
  async getAllComments(
    @Param("id", ParseIntPipe) id: number,
    @Token(PayloadFromTokenPipe) tokenPayload: AccessTokenPayloadDto | null
  ) {
    const comments = await this.commentsService.findAllExcursionComments(
      id,
      tokenPayload?.id
    );
    return comments.map((c) => new CommentDto(c));
  }

  @ApiOperation({ summary: "Create excursion comment" })
  @ApiOkResponse({
    description: "OK",
    type: CommentDto,
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
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post("excursions/:id")
  async createComment(
    @Param("id", ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
    @Body() createCommentDto: CreateCommentDto
  ) {
    const comment = await this.commentsService.createExcursionComment(
      id,
      tokenPayload.id,
      createCommentDto
    );
    return new CommentDto(comment);
  }

  @ApiOperation({ summary: "Update excursion comment" })
  @ApiOkResponse({
    description: "OK",
    type: CommentDto,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationExceptionDto,
  })
  @ApiForbiddenResponse({
    type: ForbiddenException,
  })
  @ApiParam({
    name: "commentId",
    type: Number,
    description: "The ID of the comment",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Put(":commentId")
  async updateComment(
    @Param("commentId", ParseIntPipe) commentId: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    const hasPermissionByRoles = tokenPayload.roles.some((role) =>
      [RoleNamesEnum.ADMIN, RoleNamesEnum.MODERATOR].includes(role.name)
    );
    if (!hasPermissionByRoles) {
      const userIsCommentOwner = await this.commentsService.checkCanManage(
        tokenPayload.id,
        commentId
      );
      if (!userIsCommentOwner)
        throw new ForbiddenException({ message: "Access forbidden" });
    }
    const comment = await this.commentsService.updateComment(
      commentId,
      updateCommentDto
    );
    return new CommentDto(comment);
  }

  @ApiOperation({ summary: "Delete place comment" })
  @ApiOkResponse({
    description: "OK",
  })
  @ApiForbiddenResponse({
    type: ForbiddenException,
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
  })
  @ApiParam({
    name: "commentId",
    type: Number,
    description: "The ID of the comment",
  })
  @Auth()
  @Delete(":commentId")
  async deleteComment(
    @Param("commentId", ParseIntPipe) commentId: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto
  ) {
    const hasPermissionByRoles = tokenPayload.roles.some((role) =>
      [RoleNamesEnum.ADMIN, RoleNamesEnum.MODERATOR].includes(role.name)
    );
    if (!hasPermissionByRoles) {
      const userIsCommentOwner = await this.commentsService.checkCanManage(
        tokenPayload.id,
        commentId
      );
      if (!userIsCommentOwner)
        throw new ForbiddenException({ message: "Access forbidden" });
    }
    await this.commentsService.deleteComment(commentId);
    return;
  }
}
