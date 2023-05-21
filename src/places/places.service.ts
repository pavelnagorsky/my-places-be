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
    place.title = titleTranslation.id;
    place.description = descriptionTranslation.id;
    place.address = addressTranslation.id;
    place.type = placeType;
    place.coordinates = createPlaceDto.coordinates;
    place.categories = placeCategories;
    place.images = placeImages;
    if (createPlaceDto.website) place.website = createPlaceDto.website;
    place.author = author;

    return await this.placesRepository.save(place);
  }

  async findAll(): Promise<Place[]> {
    return await this.placesRepository.find({
      relations: {
        images: true,
        type: {
          image: true,
        },
        categories: {
          image: true,
        },
        comments: true,
      },
    });
  }
}
