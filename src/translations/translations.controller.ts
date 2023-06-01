import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  PickType,
} from '@nestjs/swagger';
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
  UseInterceptors,
} from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { TranslationDto } from './dto/translation.dto';

@ApiTags('Translations')
@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @ApiOperation({ summary: 'Create Translation' })
  @ApiOkResponse({
    description: 'OK',
    type: TranslationDto,
  })
  @ApiBody({
    type: CreateTranslationDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() createTranslationDto: CreateTranslationDto) {
    const translation = await this.translationsService.createTranslation(
      createTranslationDto.langId,
      createTranslationDto.text,
      createTranslationDto.original,
      createTranslationDto.textId,
    );
    return new TranslationDto(translation);
  }

  @ApiOperation({ summary: 'Update Translation' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(TranslationDto, ['id'] as const),
  })
  @ApiParam({
    name: 'id',
    description: 'translation id',
    type: Number,
  })
  @ApiBody({
    type: UpdateTranslationDto,
  })
  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTranslationDto: UpdateTranslationDto,
  ) {
    return await this.translationsService.update(id, updateTranslationDto);
  }

  @ApiOperation({ summary: 'Find all translations' })
  @ApiOkResponse({
    description: 'OK',
    type: TranslationDto,
    isArray: true,
  })
  @Get()
  async getAll() {
    const translations = await this.translationsService.getAll();
    return translations.map((t) => new TranslationDto(t));
  }

  @ApiOperation({ summary: 'Delete Translation' })
  @ApiOkResponse({
    description: 'OK',
    type: PickType(TranslationDto, ['id'] as const),
  })
  @ApiParam({
    name: 'id',
    description: 'translation id',
    type: Number,
  })
  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.translationsService.deleteTranslation(id);
  }
}
