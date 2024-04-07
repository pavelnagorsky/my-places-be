import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './dto/comment.dto';
import { Token } from '../auth/decorators/token.decorator';
import { PayloadFromTokenPipe } from '../auth/pipes/payload-from-token.pipe';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { ValidationExceptionDto } from '../../shared/validation/validation-exception.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';

@ApiTags('Comments')
@Controller('/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Get place comments' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'OK',
    type: CommentDto,
    isArray: true,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the place',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('places/:id')
  async getAllComments(
    @Param('id', ParseIntPipe) id: number,
    @Token(PayloadFromTokenPipe) tokenPayload: AccessTokenPayloadDto | null,
  ) {
    const comments = await this.commentsService.findAllPlaceComments(
      id,
      tokenPayload?.id,
    );
    return comments.map((c) => new CommentDto(c));
  }

  @ApiOperation({ summary: 'Create place comment' })
  @ApiOkResponse({
    description: 'OK',
    type: CommentDto,
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
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post('places/:id')
  async createComment(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.commentsService.createPlaceComment(
      id,
      tokenPayload.id,
      createCommentDto,
    );
    return new CommentDto(comment);
  }

  @ApiOperation({ summary: 'Update your place comment' })
  @ApiOkResponse({
    description: 'OK',
    type: CommentDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiForbiddenResponse({
    type: ForbiddenException,
  })
  @ApiParam({
    name: 'commentId',
    type: Number,
    description: 'The ID of the comment',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Put(':commentId')
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const userIsCommentOwner = await this.commentsService.checkCanManage(
      tokenPayload.id,
      commentId,
    );
    if (!userIsCommentOwner)
      throw new ForbiddenException({ message: 'Access forbidden' });
    const comment = await this.commentsService.updateComment(
      commentId,
      updateCommentDto,
    );
    return new CommentDto(comment);
  }

  @ApiOperation({ summary: 'Administration - Update place comment' })
  @ApiOkResponse({
    description: 'OK',
    type: CommentDto,
  })
  @ApiParam({
    name: 'commentId',
    type: Number,
    description: 'The ID of the comment',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Put(':commentId/administration')
  async administrationUpdateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.commentsService.updateComment(
      commentId,
      updateCommentDto,
    );
    return new CommentDto(comment);
  }

  @ApiOperation({ summary: 'Delete your place comment' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiForbiddenResponse({
    type: ForbiddenException,
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
  })
  @ApiParam({
    name: 'commentId',
    type: Number,
    description: 'The ID of the comment',
  })
  @Auth()
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
  ) {
    const userIsCommentOwner = await this.commentsService.checkCanManage(
      tokenPayload.id,
      commentId,
    );
    if (!userIsCommentOwner)
      throw new ForbiddenException({ message: 'Access forbidden' });
    await this.commentsService.deleteComment(commentId);
    return;
  }

  @ApiOperation({ summary: 'Administration - Delete place comment' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
  })
  @ApiParam({
    name: 'commentId',
    type: Number,
    description: 'The ID of the comment',
  })
  @Auth(RoleNamesEnum.ADMIN, RoleNamesEnum.MODERATOR)
  @Delete(':commentId/administration')
  async administrationDeleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    await this.commentsService.deleteComment(commentId);
    return;
  }
}
