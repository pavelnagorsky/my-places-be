import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
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

  @Get()
  findAll() {
    return this.excursionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.excursionsService.findOne(+id);
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
