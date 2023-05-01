import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  PickType,
} from '@nestjs/swagger';
import { LanguageDto } from './dto/language.dto';

@ApiTags('Languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @ApiOkResponse({
    description: 'OK',
    type: LanguageDto,
  })
  @ApiOperation({ summary: 'Create language' })
  @ApiBody({
    type: CreateLanguageDto,
  })
  @Post()
  async create(
    @Body() createLanguageDto: CreateLanguageDto,
  ): Promise<LanguageDto> {
    return await this.languagesService.create(createLanguageDto);
  }

  @ApiOkResponse({
    description: 'OK',
    type: LanguageDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all languages' })
  @Get()
  async findAll() {
    return await this.languagesService.findAll();
  }

  @ApiOkResponse({
    description: 'OK',
    type: LanguageDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'No language was found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiOperation({ summary: 'Get language by id' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.languagesService.findOne(id);
  }

  @ApiOkResponse({
    description: 'OK',
    type: LanguageDto,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'No language was found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiOperation({ summary: 'Update language by id' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ): Promise<LanguageDto> {
    return await this.languagesService.update(id, updateLanguageDto);
  }

  @ApiOkResponse({
    description: 'OK',
    type: PickType(LanguageDto, ['id']),
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'No language was found',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the language',
  })
  @ApiOperation({ summary: 'Delete language by id' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deletedId = await this.languagesService.remove(id);
    return {
      id: deletedId,
    };
  }
}
