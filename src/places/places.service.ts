import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Equal, In, Repository } from 'typeorm';
import { CreatePlaceDto } from './dto/create-place.dto';
import { TranslationsService } from '../translations/translations.service';
import { PlaceType } from '../place-types/entities/place-type.entity';
import { PlaceCategory } from '../place-categories/entities/place-category.entity';
import { ImagesService } from '../images/images.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(PlaceType)
    private placeTypesRepository: Repository<PlaceType>,
    @InjectRepository(PlaceCategory)
    private placeCategoriesRepository: Repository<PlaceCategory>,
    private imagesService: ImagesService,
    private translationsService: TranslationsService,
  ) {}

  async create(langId: number, author: User, createPlaceDto: CreatePlaceDto) {
    const placeType = await this.placeTypesRepository.findOne({
      where: {
        id: Equal(createPlaceDto.placeTypeId),
      },
    });
    if (!placeType)
      throw new BadRequestException({
        message: `No place type with id: ${createPlaceDto.placeTypeId} found`,
      });

    const placeCategories = await this.placeCategoriesRepository.findBy({
      id: In(createPlaceDto.categoriesIds),
    });

    const placeImages = await this.imagesService.updatePositions(
      createPlaceDto.imagesIds,
    );

    const titleTranslation = await this.translationsService.createTranslation(
      langId,
      createPlaceDto.title,
      true,
    );
    await this.translationsService.translateAll(
      titleTranslation.text,
      titleTranslation.textId,
      langId,
    );

    const descriptionTranslation =
      await this.translationsService.createTranslation(
        langId,
        createPlaceDto.description,
        true,
      );
    await this.translationsService.translateAll(
      descriptionTranslation.text,
      descriptionTranslation.textId,
      langId,
    );

    const addressTranslation = await this.translationsService.createTranslation(
      langId,
      createPlaceDto.address,
      true,
    );
    await this.translationsService.translateAll(
      addressTranslation.text,
      addressTranslation.textId,
      langId,
    );
    if (!titleTranslation || !descriptionTranslation || !addressTranslation)
      throw new BadRequestException({ message: 'Invalid text data' });

    const place = this.placesRepository.create();
    place.title = titleTranslation.textId;
    place.description = descriptionTranslation.textId;
    place.address = addressTranslation.textId;
    place.type = placeType;
    place.coordinates = createPlaceDto.coordinates;
    place.categories = placeCategories;
    place.images = placeImages;
    if (createPlaceDto.website) place.website = createPlaceDto.website;
    place.author = author;

    const { id } = await this.placesRepository.save(place);
    return { id: id };
  }

  async findAll(langId: number) {
    return this.placesRepository
      .createQueryBuilder('place')
      .leftJoinAndSelect('place.categories', 'categories')
      .leftJoinAndSelect('place.type', 'type')
      .leftJoinAndMapOne(
        'place.images',
        'image',
        'place_image',
        'place_image.place = place.id AND place_image.position = :position',
        { position: 0 },
      )
      .leftJoinAndMapOne(
        'type.image',
        'image',
        'type_image',
        'type.image = type_image.id',
      )
      .leftJoinAndMapOne(
        'categories.image',
        'image',
        'categories_image',
        'categories.image = categories_image.id',
      )
      .leftJoinAndMapOne(
        'type.title',
        'translation',
        'type_t',
        'type.title = type_t.textId AND type_t.language = :langId',
        { langId },
      )
      .leftJoinAndMapOne(
        'categories.title',
        'translation',
        'categories_t',
        'categories.title = categories_t.textId AND categories_t.language = :langId',
        { langId },
      )
      .leftJoinAndMapOne(
        'place.title',
        'translation',
        'title_t',
        'place.title = title_t.textId AND title_t.language = :langId',
        { langId },
      )
      .leftJoinAndMapOne(
        'place.address',
        'translation',
        'address_t',
        'place.address = address_t.textId AND address_t.language = :langId',
        { langId },
      )
      .getMany();

    //   return await this.placesRepository.find({
    //     relations: {
    //       images: true,
    //       type: {
    //         image: true,
    //       },
    //       categories: {
    //         image: true,
    //       },
    //       comments: true,
    //     },
    //   });
  }
}
