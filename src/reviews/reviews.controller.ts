import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  PickType,
} from '@nestjs/swagger';
import { ValidationExceptionDto } from '../shared/validation/validation-exception.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Review } from './entities/review.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from '../users/entities/user.entity';
import { ReviewDto } from './dto/review.dto';
import { SearchResponseDto } from './dto/search-response.dto';

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

  @ApiOperation({ summary: 'Get all reviews by place id' })
  @ApiOkResponse({
    description: 'OK',
    type: SearchResponseDto,
  })
  @ApiParam({
    name: 'placeId',
    type: Number,
    description: 'The ID of the place',
  })
  @ApiQuery({
    name: 'lastIndex',
    type: Number,
    description: 'Last lazy loading index',
  })
  @ApiQuery({
    name: 'itemsPerPage',
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('place/:placeId')
  async findAllByPlace(
    @Param('placeId', ParseIntPipe) placeId: number,
    @Query('lastIndex', ParseIntPipe) lastIndex: number,
    @Query('itemsPerPage', ParseIntPipe) itemsPerPage: number,
    @Query('lang', ParseIntPipe) langId: number,
  ) {
    const data = await this.reviewsService.findAllByPlaceId(
      placeId,
      langId,
      itemsPerPage,
      lastIndex,
    );
    return new SearchResponseDto(
      data.reviews.map((r) => new ReviewDto(r)),
      data.hasMore,
      data.totalCount,
    );
  }

  @ApiOperation({ summary: 'Get all reviews by language id' })
  @ApiOkResponse({
    description: 'OK',
    type: ReviewDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(@Query('lang', ParseIntPipe) langId: number) {
    const reviews = await this.reviewsService.findAll(langId);
    return reviews.map((r) => new ReviewDto(r));
  }

  @ApiOperation({ summary: 'Get review by id and language id' })
  @ApiOkResponse({
    description: 'OK',
    type: ReviewDto,
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}
