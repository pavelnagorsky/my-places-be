import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Equal, In, Repository } from 'typeorm';
import { CreatePlaceDto } from './dto/create-place.dto';
import { TranslationsService } from '../translations/translations.service';
import { PlaceType } from '../place-types/entities/place-type.entity';
import { PlaceCategory } from '../place-categories/entities/place-category.entity';
import { ImagesService } from '../images/images.service';
import { User } from '../users/entities/user.entity';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { Like } from './entities/like.entity';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Admin } from '../entities/admin.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(PlaceType)
    private placeTypesRepository: Repository<PlaceType>,
    @InjectRepository(PlaceCategory)
    private placeCategoriesRepository: Repository<PlaceCategory>,
    private imagesService: ImagesService,
    private translationsService: TranslationsService,
  ) {}

  private async createTranslations(
    langId: number,
    dto: CreatePlaceDto | UpdatePlaceDto,
    translateAll = true,
  ) {
    const titleTranslation = await this.translationsService.createTranslation(
      langId,
      dto.title,
      true,
    );

    const descriptionTranslation =
      await this.translationsService.createTranslation(
        langId,
        dto.description,
        true,
      );

    const addressTranslation = await this.translationsService.createTranslation(
      langId,
      dto.address,
      true,
    );
    if (!titleTranslation || !descriptionTranslation || !addressTranslation)
      throw new BadRequestException({ message: 'Invalid text data' });

    if (translateAll) {
      await this.translationsService.translateAll(
        titleTranslation.text,
        titleTranslation.textId,
        langId,
      );
      await this.translationsService.translateAll(
        descriptionTranslation.text,
        descriptionTranslation.textId,
        langId,
      );
      await this.translationsService.translateAll(
        addressTranslation.text,
        addressTranslation.textId,
        langId,
      );
    }

    return {
      titleTranslation,
      descriptionTranslation,
      addressTranslation,
    };
  }

  private async validatePlaceType(dto: CreatePlaceDto | UpdatePlaceDto) {
    const placeType = await this.placeTypesRepository.findOne({
      where: {
        id: Equal(dto.placeTypeId),
      },
    });
    if (!placeType)
      throw new BadRequestException({
        message: `No place type with id: ${dto.placeTypeId} found`,
      });
    return placeType;
  }

  private async validatePlaceCategories(dto: CreatePlaceDto | UpdatePlaceDto) {
    const placeCategories = await this.placeCategoriesRepository.findBy({
      id: In(dto.categoriesIds),
    });
    return placeCategories ?? [];
  }

  private async validateSlugExists(slug: string) {
    return this.placesRepository.exist({
      where: {
        slug: Equal(slug),
      },
    });
  }

  async create(langId: number, author: User, createPlaceDto: CreatePlaceDto) {
    const slugExists = await this.validateSlugExists(createPlaceDto.slug);
    if (slugExists)
      throw new BadRequestException({
        message: `Slug ${createPlaceDto.slug} already exists!`,
      });
    const placeType = await this.validatePlaceType(createPlaceDto);
    const placeCategories = await this.validatePlaceCategories(createPlaceDto);

    const placeImages = await this.imagesService.updatePositions(
      createPlaceDto.imagesIds,
    );

    const translations = await this.createTranslations(langId, createPlaceDto);

    const place = this.placesRepository.create();
    place.slug = createPlaceDto.slug;
    place.title = translations.titleTranslation.textId;
    place.description = translations.descriptionTranslation.textId;
    place.address = translations.addressTranslation.textId;
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
      .orderBy({
        'place.likesCount': 'DESC',
        'place.viewsCount': 'DESC',
        'place.createdAt': 'DESC',
      })
      .getMany();
  }

  private async addView(placeId: number) {
    return this.placesRepository
      .createQueryBuilder()
      .update()
      .set({ viewsCount: () => 'viewsCount + 1' })
      .where({ id: Equal(placeId) })
      .execute();
  }

  private isLikedByUser(placeLikes: Like[], userId: number): boolean {
    return placeLikes.findIndex((pl) => pl.user?.id === userId) !== -1;
  }

  private async checkExist(placeId: number): Promise<boolean> {
    return this.placesRepository.exist({
      where: {
        id: Equal(placeId),
      },
    });
  }

  async findOneBySlug(
    slug: string,
    langId: number,
    tokenPayload: TokenPayloadDto | null = null,
  ) {
    const place = await this.placesRepository
      .createQueryBuilder('place')
      .where('place.slug = :slug', { slug })
      .leftJoinAndSelect('place.categories', 'categories')
      .leftJoinAndSelect('place.type', 'type')
      .leftJoinAndSelect('place.images', 'image')
      .addOrderBy('image.position')
      .leftJoinAndSelect('place.likes', 'like')
      .leftJoinAndSelect('like.user', 'likeUser')
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
        'place.description',
        'translation',
        'description_t',
        'place.description = description_t.textId AND description_t.language = :langId',
        { langId },
      )
      .leftJoinAndMapOne(
        'place.address',
        'translation',
        'address_t',
        'place.address = address_t.textId AND address_t.language = :langId',
        { langId },
      )
      .getOne();
    if (!place) throw new NotFoundException({ message: 'Place not found' });
    this.addView(place.id);
    return {
      ...place,
      isLiked: Boolean(
        tokenPayload?.id && this.isLikedByUser(place.likes, tokenPayload.id),
      ),
    };
  }

  async checkUserRelation(userId: number, placeId: number) {
    return await this.placesRepository.exist({
      where: {
        author: {
          id: Equal(userId),
        },
        id: Equal(placeId),
      },
    });
  }

  async getPlacesSlugs() {
    return this.placesRepository
      .createQueryBuilder('place')
      .select(['place.id', 'place.slug'])
      .getMany();
  }

  private createLike() {
    const like = this.likesRepository.create();
    like.place = new Place();
    like.user = new User();
    return like;
  }

  async changeLike(userId: number, placeId: number) {
    const place = await this.placesRepository.findOne({
      where: { id: Equal(placeId) },
      relations: {
        likes: true,
      },
      select: {
        id: true,
        likes: true,
        likesCount: true,
      },
    });
    if (!place) throw new NotFoundException({ message: 'Place not found' });
    const likeExists = await this.likesRepository.exist({
      where: {
        user: {
          id: Equal(userId),
        },
        place: {
          id: Equal(placeId),
        },
      },
    });
    if (likeExists) {
      place.likesCount = --place.likesCount;
      await this.placesRepository.save(place);
      await this.likesRepository.delete({
        place: {
          id: Equal(placeId),
        },
        user: {
          id: Equal(userId),
        },
      });
      await this.placesRepository.save(place);
      return;
    } else {
      place.likesCount = ++place.likesCount;
      const like = this.createLike();
      like.place.id = placeId;
      like.user.id = userId;
      const savedLike = await this.likesRepository.save(like);
      place.likes.push(savedLike);
      await this.placesRepository.save(place);
      return;
    }
  }

  async updatePlace(
    placeId: number,
    langId: number,
    updatePlaceDto: UpdatePlaceDto,
    admin?: Admin,
  ) {
    try {
      const exist = await this.checkExist(placeId);
      if (!exist) throw new BadRequestException({ message: 'Not exits' });

      const placeType = await this.validatePlaceType(updatePlaceDto);
      const placeCategories = await this.validatePlaceCategories(
        updatePlaceDto,
      );

      const placeImages = await this.imagesService.updatePositions(
        updatePlaceDto.imagesIds,
      );

      const translations = await this.createTranslations(
        langId,
        updatePlaceDto,
        updatePlaceDto.shouldTranslate,
      );

      await this.placesRepository.save({
        id: placeId,
        slug: updatePlaceDto.slug,
        images: placeImages,
        title: translations.titleTranslation.textId,
        description: translations.descriptionTranslation.textId,
        address: translations.addressTranslation.textId,
        type: placeType,
        coordinates: updatePlaceDto.coordinates,
        categories: placeCategories,
        website: updatePlaceDto.website,
        moderation: !admin,
        admin: admin,
      });

      return { id: placeId };
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new BadRequestException({ message: 'Incorrect details' });
    }
  }
}
