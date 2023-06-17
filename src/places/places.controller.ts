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
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  PickType,
} from '@nestjs/swagger';
import { SearchPlaceDto } from './dto/search-place.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from '../users/entities/user.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { PlaceDto } from './dto/place.dto';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { Token } from '../auth/decorators/token.decorator';
import { PayloadFromTokenPipe } from '../auth/pipes/payload-from-token.pipe';
import { Place } from './entities/place.entity';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CommentsService } from '../comments/comments.service';
import { CommentDto } from '../comments/dto/comment.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { UpdateCommentDto } from '../comments/dto/update-comment.dto';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { PlaceSlugDto } from './dto/place-slug.dto';

@ApiTags('Places')
@Controller('/places')
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
    private readonly commentsService: CommentsService,
  ) {}

  @ApiOperation({ summary: 'Create Place' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Place, ['id']),
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

  @ApiOperation({ summary: 'Get all places by language id' })
  @ApiOkResponse({
    description: 'OK',
    type: SearchPlaceDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getAll(@Query('lang', ParseIntPipe) langId: number) {
    const places = await this.placesService.findAll(langId);
    return places.map((p) => new SearchPlaceDto(p));
  }

  @ApiOperation({ summary: 'Get all places slugs' })
  @ApiOkResponse({
    description: 'OK',
    type: PlaceSlugDto,
    isArray: true,
  })
  @Get('slugs')
  async getPlacesSlugs() {
    const slugs = await this.placesService.getPlacesSlugs();
    return slugs;
  }

  @ApiOperation({ summary: 'Get place by slug and language id' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'OK',
    type: PlaceDto,
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
  @Get(':slug')
  async getById(
    @Param('slug') slug: string,
    @Query('lang', ParseIntPipe) langId: number,
    @Token(PayloadFromTokenPipe) tokenPayload: TokenPayloadDto | null,
  ) {
    const place = await this.placesService.findOneBySlug(
      slug,
      langId,
      tokenPayload,
    );
    return new PlaceDto(place);
  }

  @ApiOperation({ summary: 'Update Place' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Place, ['id']),
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
  @Auth()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
    @TokenPayload() tokenPayload: TokenPayloadDto,
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

  @ApiOperation({ summary: 'Change like' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the place',
  })
  @Auth()
  @Put(':id/likes')
  async changeLike(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: TokenPayloadDto,
  ) {
    return await this.placesService.changeLike(tokenPayload.id, id);
  }

  @ApiOperation({ summary: 'Get comments' })
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
  @Get(':id/comments')
  async getAllComments(
    @Param('id', ParseIntPipe) id: number,
    @Token(PayloadFromTokenPipe) tokenPayload: TokenPayloadDto | null,
  ) {
    const comments = await this.commentsService.findAllPlaceComments(
      id,
      tokenPayload?.id,
    );
    return comments.map((c) => new CommentDto(c));
  }

  @ApiOperation({ summary: 'Create comment' })
  @ApiOkResponse({
    description: 'OK',
    type: CommentDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the place',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post(':id/comments')
  async createComment(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: TokenPayloadDto,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.commentsService.createPlaceComment(
      id,
      tokenPayload.id,
      createCommentDto,
    );
    return new CommentDto(comment);
  }

  @ApiOperation({ summary: 'Update your comment' })
  @ApiOkResponse({
    description: 'OK',
    type: CommentDto,
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
  @Put('comments/:commentId')
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @TokenPayload() tokenPayload: TokenPayloadDto,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const userIsCommentOwner = await this.commentsService.checkCanManage(
      tokenPayload.id,
      commentId,
    );
    if (!userIsCommentOwner)
      throw new ForbiddenException({ message: 'Access forbidden' });
    const comment = await this.commentsService.updatePlaceComment(
      commentId,
      updateCommentDto,
    );
    return new CommentDto(comment);
  }

  @ApiOperation({ summary: 'Administration - Update comment' })
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
  @Auth(RoleNamesEnum.OWNER, RoleNamesEnum.ADMIN)
  @Put('comments/:commentId/administration')
  async administrationUpdateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.commentsService.updatePlaceComment(
      commentId,
      updateCommentDto,
    );
    return new CommentDto(comment);
  }

  @ApiOperation({ summary: 'Delete your comment' })
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
  @Delete('comments/:commentId')
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @TokenPayload() tokenPayload: TokenPayloadDto,
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

  @ApiOperation({ summary: 'Administration - Delete comment' })
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
  @Auth(RoleNamesEnum.OWNER, RoleNamesEnum.ADMIN)
  @Delete('comments/:commentId/administration')
  async administrationDeleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    await this.commentsService.deleteComment(commentId);
    return;
  }
}
