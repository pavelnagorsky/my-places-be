import {
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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
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
import { ValidationExceptionDto } from '../../shared/validation/validation-exception.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Review } from './entities/review.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from '../users/entities/user.entity';
import { ReviewDto } from './dto/review.dto';
import { ReviewsSearchResponseDto } from './dto/reviews-search-response.dto';
import { Place } from '../places/entities/place.entity';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { MyReviewsRequestDto } from './dto/my-reviews-request.dto';
import { MyReviewsResponseDto } from './dto/my-reviews-response.dto';
import { ReviewEditDto } from './dto/review-edit.dto';
import { ModerationReviewsResponseDto } from './dto/moderation-reviews-response.dto';
import { ModerationReviewsRequestDto } from './dto/moderation-reviews-request.dto';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { ModerationDto } from '../places/dto/moderation.dto';
import { ReviewStatusesEnum } from './enums/review-statuses.enum';
import { AdministrationReviewsRequestDto } from './dto/administration-reviews-request.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Create Review' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Review, ['id']),
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
    type: CreateReviewDto,
  })
  @Auth()
  @Post()
  async create(
    @Query('lang', ParseIntPipe) langId: number,
    @TokenPayload(UserFromTokenPipe) user: User,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return await this.reviewsService.create(createReviewDto, langId, user);
  }

  @ApiOperation({ summary: 'Update Review' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Review, ['id']),
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the review',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiBody({
    type: UpdateReviewDto,
  })
  @Auth()
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const userIsReviewAuthor = await this.reviewsService.checkUserRelation(
      tokenPayload.id,
      id,
    );
    if (!userIsReviewAuthor)
      throw new ForbiddenException({
        message: 'Forbidden, user is not author',
      });
    return await this.reviewsService.update(id, langId, updateReviewDto);
  }

  @ApiOperation({ summary: 'Update Review by administration' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Review, ['id']),
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the review',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiBody({
    type: UpdateReviewDto,
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Put(':id/administration')
  async updateByAdministration(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return await this.reviewsService.update(id, langId, updateReviewDto, true);
  }

  @ApiOperation({ summary: 'Get reviews by place slug' })
  @ApiOkResponse({
    description: 'OK',
    type: ReviewsSearchResponseDto,
  })
  @ApiParam({
    name: 'placeSlug',
    type: String,
    description: 'The slug of the place',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'page index',
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('place/:placeSlug')
  async findAllByPlace(
    @Param('placeSlug') placeSlug: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
    @Query('lang', ParseIntPipe) langId: number,
  ) {
    const [reviews, total] = await this.reviewsService.findAllByPlaceSlug(
      placeSlug,
      langId,
      pageSize,
      page,
      ReviewStatusesEnum.APPROVED,
    );
    return new ReviewsSearchResponseDto(reviews, {
      requestedPage: page,
      pageSize: pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Get review by id and language id' })
  @ApiOkResponse({
    description: 'OK',
    type: ReviewDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Review id',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
  ) {
    const review = await this.reviewsService.findOne(id, langId);
    if (!review)
      throw new NotFoundException({ message: 'Review was not found' });
    return new ReviewDto(review);
  }

  @ApiOperation({ summary: 'Get my reviews' })
  @ApiOkResponse({
    description: 'OK',
    type: MyReviewsResponseDto,
  })
  @ApiBody({
    type: MyReviewsRequestDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post('my-reviews')
  async getMyReviews(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() dto: MyReviewsRequestDto,
    @TokenPayload()
    tokenPayload: AccessTokenPayloadDto,
  ) {
    const [reviews, total] = await this.reviewsService.findMyReviews(
      langId,
      dto,
      tokenPayload,
    );
    return new MyReviewsResponseDto(reviews, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Get reviews for administration' })
  @ApiOkResponse({
    description: 'OK',
    type: MyReviewsResponseDto,
  })
  @ApiBody({
    type: AdministrationReviewsRequestDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Post('administration-reviews')
  async getAdminReviews(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() dto: AdministrationReviewsRequestDto,
  ) {
    const [reviews, total] = await this.reviewsService.findAdminReviews(
      langId,
      dto,
    );
    return new MyReviewsResponseDto(reviews, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Delete Review' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Place, ['id']),
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the review',
  })
  @Auth()
  @Delete(':id')
  async deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
  ) {
    const roleNames = tokenPayload.roles.map((r) => r.name);
    if (!roleNames.includes(RoleNamesEnum.ADMIN)) {
      const userIsReviewAuthor = await this.reviewsService.checkUserRelation(
        tokenPayload.id,
        id,
      );
      if (!userIsReviewAuthor)
        throw new ForbiddenException({
          message: 'Forbidden, user is not author',
        });
    }
    const data = await this.reviewsService.removeReview(id);
    return data;
  }

  @ApiOperation({ summary: 'Get review for editing' })
  @ApiOkResponse({
    description: 'OK',
    type: ReviewEditDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the review',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get(':id/edit')
  async getReviewForEdit(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
  ) {
    const roleNames = tokenPayload.roles.map((r) => r.name);
    if (
      !roleNames.includes(RoleNamesEnum.MODERATOR) ||
      !roleNames.includes(RoleNamesEnum.ADMIN)
    ) {
      const userIsReviewAuthor = await this.reviewsService.checkUserRelation(
        tokenPayload.id,
        id,
      );
      if (!userIsReviewAuthor)
        throw new ForbiddenException({
          message: 'Forbidden, user is not author',
        });
    }
    const review = await this.reviewsService.getReviewForEdit(id, langId);
    return new ReviewEditDto(review);
  }

  @ApiOperation({ summary: 'Get moderation reviews' })
  @ApiOkResponse({
    description: 'OK',
    type: ModerationReviewsResponseDto,
  })
  @ApiBody({
    type: ModerationReviewsRequestDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.MODERATOR, RoleNamesEnum.ADMIN)
  @Post('moderation-reviews')
  async getModerationReviews(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() dto: ModerationReviewsRequestDto,
  ) {
    const [reviews, total] = await this.reviewsService.findModerationReviews(
      langId,
      dto,
    );
    return new ModerationReviewsResponseDto(reviews, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Moderate review' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The id of the review',
  })
  @ApiBody({
    type: ModerationDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.MODERATOR, RoleNamesEnum.ADMIN)
  @Post(':id/moderation')
  async moderateReview(
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() dto: ModerationDto,
    @TokenPayload(UserFromTokenPipe) moderator: User,
  ) {
    await this.reviewsService.moderateReview(reviewId, dto, moderator);
    return;
  }
}
