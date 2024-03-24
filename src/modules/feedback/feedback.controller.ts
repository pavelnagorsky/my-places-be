import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ValidationExceptionDto } from '../../shared/validation/validation-exception.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Auth } from '../../auth/decorators/auth.decorator';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { FeedbackListResponseDto } from './dto/feedback-list-response.dto';
import { FeedbackListRequestDto } from './dto/feedback-list-request.dto';
import { FeedbackDto } from './dto/feedback.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @ApiOperation({ summary: 'Create feedback' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: CreateFeedbackDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() dto: CreateFeedbackDto) {
    await this.feedbackService.createFeedback(dto);
    return;
  }

  @ApiOperation({ summary: 'Get all feedbacks' })
  @ApiOkResponse({
    description: 'OK',
    type: FeedbackListResponseDto,
  })
  @ApiBody({ type: FeedbackListRequestDto, description: 'request' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Post('list')
  async getAll(@Body() dto: FeedbackListRequestDto) {
    const [feedbackList, total] = await this.feedbackService.getFeedbackList(
      dto,
    );
    return new FeedbackListResponseDto(feedbackList, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Get feedback by id' })
  @ApiOkResponse({
    description: 'OK',
    type: FeedbackDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'feedback id',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Get(':id')
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    const feedback = await this.feedbackService.findOneById(id);
    if (!feedback)
      throw new NotFoundException({ message: 'Feedback not found' });
    return new FeedbackDto(feedback);
  }

  @ApiOperation({ summary: 'Update feedback status' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'feedback id',
  })
  @ApiBody({ type: UpdateStatusDto, description: 'new status' })
  @Auth(RoleNamesEnum.ADMIN)
  @Put(':id')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    await this.feedbackService.updateStatus(id, dto);
    return;
  }
}
