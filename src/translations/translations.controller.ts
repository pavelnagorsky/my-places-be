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
  Patch,
  Post,
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

  @ApiOkResponse({
    description: 'OK',
    type: TranslationDto,
  })
  @ApiBody({
    type: CreateTranslationDto,
  })
  @ApiOperation({ summary: 'Create Translation' })
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
  @ApiOperation({ summary: 'Update Translation' })
  @Patch('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTranslationDto: UpdateTranslationDto,
  ) {
    return await this.translationsService.update(id, updateTranslationDto);
  }

  @ApiOkResponse({
    description: 'OK',
    type: TranslationDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Find all translations' })
  @Get()
  async getAll() {
    const translations = await this.translationsService.getAll();
    return translations.map((t) => new TranslationDto(t));
  }

  @ApiOkResponse({
    description: 'OK',
    type: PickType(TranslationDto, ['id'] as const),
  })
  @ApiParam({
    name: 'id',
    description: 'translation id',
    type: Number,
  })
  @ApiOperation({ summary: 'Delete Translation' })
  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.translationsService.deleteTranslation(id);
  }
}
