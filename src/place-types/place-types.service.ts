import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlaceTypeDto } from './dto/create-place-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaceType } from './entities/place-type.entity';
import { TranslationsService } from '../translations/translations.service';
import { Image } from '../images/entities/image.entity';
import { LanguagesService } from '../languages/languages.service';
import { Translation } from '../translations/entities/translation.entity';
import { UpdatePlaceCategoryDto } from '../place-categories/dto/update-place-category.dto';
import { UpdatePlaceTypeDto } from './dto/update-place-type.dto';

@Injectable()
export class PlaceTypesService {
  constructor(
    @InjectRepository(PlaceType)
    private placeTypesRepository: Repository<PlaceType>,
    private translationsService: TranslationsService,
    private languagesService: LanguagesService,
  ) {}

  // This action adds a new placeType
  async create(dto: CreatePlaceTypeDto) {
    const languages = await this.languagesService.findAll();
    if (languages.length !== dto.titleTranslations.length)
      throw new BadRequestException({ message: 'Not all languages set' });

    const translations: Promise<Translation>[] = [];
    const newTextId = await this.translationsService.getMaxTextId();
    for (let i = 0; i < dto.titleTranslations.length; i++) {
      const newTranslationPromise = this.translationsService.createTranslation(
        dto.titleTranslations[i].langId,
        dto.titleTranslations[i].text,
        true,
        newTextId,
      );
      translations.push(newTranslationPromise);
    }

    await Promise.all(translations);
    const placeType = await this.placeTypesRepository.create({
      title: newTextId,
      commercial: dto.commercial,
    });
    if (dto.imageId) {
      placeType.image = new Image();
      placeType.image.id = dto.imageId;
    } else {
      placeType.image = null;
    }
    if (dto.imageId2) {
      placeType.image2 = new Image();
      placeType.image2.id = dto.imageId2;
    } else {
      placeType.image2 = null;
    }

    return await this.placeTypesRepository.save(placeType);
  }

  async update(id: number, dto: UpdatePlaceTypeDto) {
    const type = await this.placeTypesRepository.findOne({
      where: { id: id },
      select: { title: true },
    });
    if (!type)
      throw new NotFoundException(`Place type with id ${id} was not found`);
    const languages = await this.languagesService.findAll();
    if (languages.length !== dto.titleTranslations.length)
      throw new BadRequestException({ message: 'Not all languages set' });

    const translations: Promise<{ id: number }>[] = [];
    for (let i = 0; i < dto.titleTranslations.length; i++) {
      const newTranslationPromise = this.translationsService.update(
        type.title,
        {
          langId: dto.titleTranslations[i].langId,
          textId: type.title,
          text: dto.titleTranslations[i].text,
          original: true,
        },
      );
      translations.push(newTranslationPromise);
    }

    await Promise.all(translations);
    const placeType = await this.placeTypesRepository.create({
      title: type.title,
      commercial: dto.commercial,
    });
    if (dto.imageId) {
      placeType.image = new Image();
      placeType.image.id = dto.imageId;
    } else {
      placeType.image = null;
    }
    if (dto.imageId2) {
      placeType.image2 = new Image();
      placeType.image2.id = dto.imageId2;
    } else {
      placeType.image2 = null;
    }

    return await this.placeTypesRepository.save(placeType);
  }

  // This action finds all placeTypes by language id
  async findAll(langId: number) {
    return await this.placeTypesRepository
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.image', 'image')
      .leftJoinAndSelect('pt.image2', 'image2')
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
      .leftJoinAndSelect('pt.image2', 'image2')
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

  async findOneAdministration(id: number) {
    const placeType = await this.placeTypesRepository
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.image', 'image')
      .leftJoinAndSelect('pt.image2', 'image2')
      .innerJoinAndMapMany(
        'pt.titleTranslations',
        'translation',
        't',
        'pt.title = t.textId',
      )
      .where('pt.id = :id', { id })
      .getOne();
    if (!placeType)
      throw new NotFoundException({
        message: `Place type with id ${id} was not found`,
      });
    return placeType;
  }

  async remove(id: number) {
    const entity = await this.placeTypesRepository.findOne({
      where: { id: id },
      select: { id: true },
    });
    if (!entity)
      throw new NotFoundException({ message: 'No place type was found' });
    const deleted = await this.placeTypesRepository.remove([entity]);
    if (!deleted.length)
      throw new NotFoundException({ message: 'Can not delete' });
    return { id: id };
  }
}
