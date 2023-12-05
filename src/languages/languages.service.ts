import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './entities/language.entity';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private languagesRepository: Repository<Language>,
  ) {}

  // This action adds a new language
  async create(createLanguageDto: CreateLanguageDto) {
    const language = this.languagesRepository.create({
      title: createLanguageDto.title,
      code: createLanguageDto.code,
    });
    return this.languagesRepository.save(language);
  }

  // This action returns all languages
  async findAll() {
    return this.languagesRepository.find();
  }

  // This action returns a #id language
  async findOneById(id: number) {
    return await this.languagesRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  // This action updates a #id language
  async update(id: number, updateLanguageDto: UpdateLanguageDto) {
    const language = await this.languagesRepository.findOneBy({ id: id });
    if (!language) throw new NotFoundException('No language was found');
    return this.languagesRepository.save({
      ...language,
      ...updateLanguageDto,
    } as Language);
  }

  // This action removes a #id language
  async remove(id: number) {
    const result = await this.languagesRepository.delete(id);
    if (!result.affected) throw new NotFoundException('No language was found');
    return id;
  }
}
