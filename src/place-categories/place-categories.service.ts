import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaceCategoryDto } from './dto/create-place-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranslationsService } from '../translations/translations.service';
import { PlaceCategory } from './entities/place-category.entity';
import { PlaceCategoryDto } from './dto/place-category.dto';
import { Image } from '../images/entities/image.entity';

@Injectable()
export class PlaceCategoriesService {
  constructor(
    @InjectRepository(PlaceCategory)
    private placeCategoriesRepository: Repository<PlaceCategory>,
    private translationsService: TranslationsService,
  ) {}

  async create(langId: number, createPlaceCategoryDto: CreatePlaceCategoryDto) {
    const titleTranslation = await this.translationsService.createTranslation(
      langId,
      createPlaceCategoryDto.title,
      true,
    );
    const placeCategory = this.placeCategoriesRepository.create({
      title: titleTranslation.textId,
    });
    if (createPlaceCategoryDto.imageId) {
      placeCategory.image = new Image();
      placeCategory.image.id = createPlaceCategoryDto.imageId;
    }

    await this.placeCategoriesRepository.save(placeCategory);
    await this.translationsService.translateAll(
      titleTranslation.text,
      titleTranslation.textId,
      langId,
    );
    const placeCategoryDto = new PlaceCategoryDto(placeCategory);
    placeCategoryDto.title = titleTranslation.text;
    return placeCategoryDto;
  }

  async findAll(langId: number) {
    return await this.placeCategoriesRepository
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.image', 'image')
      .innerJoinAndMapOne(
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
      throw new NotFoundException(
        `Place category with id ${id} by language id ${langId} was not found`,
      );
    return placeCategory;
  }

  // update(id: number, updatePlaceCategoryDto: UpdatePlaceCategoryDto) {
  //   return `This action updates a #${id} placeCategory`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} placeCategory`;
  // }
}
