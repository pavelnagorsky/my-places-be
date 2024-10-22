import {
  Body,
  Controller,
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
} from '@nestjs/swagger';
import { LanguageDto } from './dto/language.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';

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
  @Auth(RoleNamesEnum.ADMIN)
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
    const languages = await this.languagesService.findAll();
    return languages
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
  @Auth(RoleNamesEnum.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ): Promise<LanguageDto> {
    return await this.languagesService.update(id, updateLanguageDto);
  }
}
