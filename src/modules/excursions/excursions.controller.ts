import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ExcursionsService } from './excursions.service';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
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
import { Excursion } from './entities/excursion.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from '../users/entities/user.entity';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { RoutesListResponseDto } from '../routes/dto/routes-list-response.dto';
import { RoutesListRequestDto } from '../routes/dto/routes-list-request.dto';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { ExcursionsListRequestDto } from './dto/excursions-list-request.dto';
import { ExcursionsListResponseDto } from './dto/excursions-list-response.dto';
import { PlaceDto } from '../places/dto/place.dto';
import { ExcursionDto } from './dto/excursion.dto';

@ApiTags('Excursions')
@Controller('excursions')
export class ExcursionsController {
  constructor(private readonly excursionsService: ExcursionsService) {}

  @ApiOperation({ summary: 'Create Excursion' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Excursion, ['id']),
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
    type: CreateExcursionDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post()
  async create(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() createExcursionDto: CreateExcursionDto,
    @TokenPayload(UserFromTokenPipe) user: User,
  ) {
    return await this.excursionsService.create(
      createExcursionDto,
      langId,
      user,
    );
  }

  @ApiOperation({ summary: 'Find my excursions' })
  @ApiOkResponse({
    description: 'OK',
    type: ExcursionsListResponseDto,
  })
  @ApiBody({
    type: ExcursionsListRequestDto,
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Post('my-excursions')
  async findMyExcursions(
    @Query('lang', ParseIntPipe) langId: number,
    @Body() dto: ExcursionsListRequestDto,
    @TokenPayload()
    tokenPayload: AccessTokenPayloadDto,
  ) {
    const [excursions, total] = await this.excursionsService.findMyExcursions(
      dto,
      langId,
      tokenPayload,
    );

    return new ExcursionsListResponseDto(excursions, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Get excursion by id and language id' })
  @ApiOkResponse({
    description: 'OK',
    type: ExcursionDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the excursion',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOneById(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang', ParseIntPipe) langId: number,
  ) {
    const excursion = await this.excursionsService.findOne(id, langId);
    if (!excursion)
      throw new NotFoundException({ message: 'Excursion not found' });
    return new ExcursionDto(excursion);
  }

  @ApiOperation({ summary: 'Get excursion by slug and language id' })
  @ApiOkResponse({
    description: 'OK',
    type: ExcursionDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'The slug of the excursion',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('slug/:slug')
  async findOneBySlug(
    @Param('slug') slug: string,
    @Query('lang', ParseIntPipe) langId: number,
  ) {
    const excursion = await this.excursionsService.findOne(slug, langId);
    if (!excursion)
      throw new NotFoundException({ message: 'Excursion not found' });
    this.excursionsService.addView(excursion.id);
    return new ExcursionDto(excursion);
  }

  @ApiOperation({ summary: 'Update Excursion' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Excursion, ['id']),
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the excursion',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiBody({
    type: UpdateExcursionDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Put(':id')
  async update(
    @Query('lang', ParseIntPipe) langId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExcursionDto: UpdateExcursionDto,
  ) {
    return await this.excursionsService.update(id, updateExcursionDto, langId);
  }

  @ApiOperation({ summary: 'Update Excursion by admin' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(Excursion, ['id']),
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the excursion',
  })
  @ApiQuery({
    name: 'lang',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiBody({
    type: UpdateExcursionDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Put(':id/administration')
  async updateByAdmin(
    @Query('lang', ParseIntPipe) langId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExcursionDto: UpdateExcursionDto,
  ) {
    return await this.excursionsService.update(
      id,
      updateExcursionDto,
      langId,
      true,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.excursionsService.remove(+id);
  }
}
