import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlaceCategoryDto } from './dto/create-place-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaceCategory } from './entities/place-category.entity';
import { LanguagesService } from '../languages/languages.service';
import { TranslationsService } from '../translations/translations.service';
import { Translation } from '../translations/entities/translation.entity';
import { Image } from '../images/entities/image.entity';
import { UpdatePlaceCategoryDto } from './dto/update-place-category.dto';

@Injectable()
export class PlaceCategoriesService {
  constructor(
    @InjectRepository(PlaceCategory)
    private placeCategoriesRepository: Repository<PlaceCategory>,
    private languagesService: LanguagesService,
    private translationsService: TranslationsService,
  ) {}

  async create(createPlaceCategoryDto: CreatePlaceCategoryDto) {
    const languages = await this.languagesService.findAll();
    if (languages.length !== createPlaceCategoryDto.titleTranslations.length)
      throw new BadRequestException({ message: 'Not all languages set' });

    const translations: Promise<Translation>[] = [];
    const newTextId = await this.translationsService.getMaxTextId();
    for (let i = 0; i < createPlaceCategoryDto.titleTranslations.length; i++) {
      const newTranslationPromise = this.translationsService.createTranslation(
        createPlaceCategoryDto.titleTranslations[i].langId,
        createPlaceCategoryDto.titleTranslations[i].text,
        true,
        newTextId,
      );
      translations.push(newTranslationPromise);
    }

    await Promise.all(translations);
    const placeCategory = await this.placeCategoriesRepository.create({
      title: newTextId,
    });
    if (createPlaceCategoryDto.imageId) {
      placeCategory.image = new Image();
      placeCategory.image.id = createPlaceCategoryDto.imageId;
    } else {
      placeCategory.image = null;
    }
    if (createPlaceCategoryDto.imageId2) {
      placeCategory.image2 = new Image();
      placeCategory.image2.id = createPlaceCategoryDto.imageId2;
    } else {
      placeCategory.image2 = null;
    }

    return await this.placeCategoriesRepository.save(placeCategory);
  }

  async update(id: number, dto: UpdatePlaceCategoryDto) {
    const category = await this.placeCategoriesRepository.findOne({
      where: { id: id },
      select: { title: true },
    });
    if (!category)
      throw new NotFoundException(`Place category with id ${id} was not found`);
    const languages = await this.languagesService.findAll();
    if (languages.length !== dto.titleTranslations.length)
      throw new BadRequestException({ message: 'Not all languages set' });

    const translations: Promise<void>[] = [];
    for (let i = 0; i < dto.titleTranslations.length; i++) {
      const newTranslationPromise =
        this.translationsService.updateByTextIdAndLangId(category.title, {
          langId: dto.titleTranslations[i].langId,
          textId: category.title,
          text: dto.titleTranslations[i].text,
          original: true,
        });
      translations.push(newTranslationPromise);
    }

    await Promise.all(translations);
    const placeCategory = this.placeCategoriesRepository.create({
      id: id,
      title: category.title,
    });
    if (dto.imageId) {
      placeCategory.image = new Image();
      placeCategory.image.id = dto.imageId;
    } else {
      placeCategory.image = null;
    }
    if (dto.imageId2) {
      placeCategory.image2 = new Image();
      placeCategory.image2.id = dto.imageId2;
    } else {
      placeCategory.image2 = null;
    }

    return await this.placeCategoriesRepository.save(placeCategory);
  }

  async findAll(langId: number) {
    return await this.placeCategoriesRepository
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.image', 'image')
      .leftJoinAndSelect('pc.image2', 'image2')
      .leftJoinAndMapOne(
        'pc.title',
        'translation',
        't',
        'pc.title = t.textId AND t.language = :langId',
        { langId },
      )
      .getMany();
  }

  async findOne(id: number, langId: number) {
    const placeCategory = await this.placeCategoriesRepository
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.image', 'image')
      .leftJoinAndSelect('pc.image2', 'image2')
      .innerJoinAndMapOne(
        'pc.title',
        'translation',
        't',
        'pc.title = t.textId AND t.language = :langId',
        { langId },
      )
      .where('pc.id = :id', { id })
      .getOne();
    if (!placeCategory)
      throw new NotFoundException({
        message: `Place category with id ${id} by language id ${langId} was not found`,
      });
    return placeCategory;
  }

  async findOneAdministration(id: number) {
    const placeCategory = await this.placeCategoriesRepository
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.image', 'image')
      .leftJoinAndSelect('pc.image2', 'image2')
      .leftJoinAndMapMany(
        'pc.titleTranslations',
        'translation',
        't',
        'pc.title = t.textId',
      )
      .leftJoinAndMapOne(
        't.language',
        't.language',
        'language',
        't.language = language.id',
      )
      .orderBy('language.id')
      .where('pc.id = :id', { id })
      .getOne();
    if (!placeCategory)
      throw new NotFoundException({
        message: `Place category with id ${id} was not found`,
      });
    return placeCategory;
  }

  async remove(id: number) {
    const entity = await this.placeCategoriesRepository.findOne({
      where: { id: id },
      select: { id: true },
    });
    if (!entity)
      throw new NotFoundException({ message: 'No category was found' });
    const deleted = await this.placeCategoriesRepository.remove([entity]);
    if (!deleted.length)
      throw new NotFoundException({ message: 'Can not delete' });
    return { id: id };
  }
}
