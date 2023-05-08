import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaceTypeDto } from './dto/create-place-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaceType } from './entities/place-type.entity';
import { TranslationsService } from '../translations/translations.service';
import { PlaceTypeDto } from './dto/place-type.dto';

@Injectable()
export class PlaceTypesService {
  constructor(
    @InjectRepository(PlaceType)
    private placeTypesRepository: Repository<PlaceType>,
    private translationsService: TranslationsService,
  ) {}

  // This action adds a new placeType
  async create(langId: number, createPlaceTypeDto: CreatePlaceTypeDto) {
    const titleTranslation = await this.translationsService.createTranslation(
      langId,
      createPlaceTypeDto.title,
      true,
    );
    // create non origin translation
    const placeType = this.placeTypesRepository.create({
      title: titleTranslation.textId,
      commercial: createPlaceTypeDto.commercial,
    });
    await this.placeTypesRepository.save(placeType);
    await this.translationsService.translateAll(
      titleTranslation.text,
      titleTranslation.textId,
      langId,
    );
    const placeTypeDto = new PlaceTypeDto(placeType);
    placeTypeDto.title = titleTranslation.text;
    return placeTypeDto;
  }

  // This action finds all placeTypes by language id
  async findAll(langId: number) {
    return await this.placeTypesRepository
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.image', 'image')
      .innerJoinAndMapOne(
        'pt.title',
        'translation',
        't',
        'pt.title = t.textId AND t.language = :langId',
        { langId },
      )
      .getMany();
  }

  async findOne(id: number, langId: number) {
    const placeType = await this.placeTypesRepository
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.image', 'image')
      .innerJoinAndMapOne(
        'pt.title',
        'translation',
        't',
        'pt.title = t.textId AND t.language = :langId',
        { langId },
      )
      .where('pt.id = :id', { id })
      .getOne();
    if (!placeType)
      throw new NotFoundException(
        `Place type with id ${id} by language id ${langId} was not found`,
      );
    return placeType;
  }

  // update(id: number, langId: number, updatePlaceTypeDto: UpdatePlaceTypeDto) {
  //   return `This action updates a #${id} placeType`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} placeType`;
  // }
}
