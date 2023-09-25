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
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
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
