import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Equal, In, Repository, SelectQueryBuilder } from 'typeorm';
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
import { SearchRequestDto } from './dto/search-request.dto';
import { ISearchServiceResponse } from './interfaces';
import { PlaceStatusesEnum } from './enums/place-statuses.enum';

@Injectable()
export class PlacesService {
  private readonly logger = new Logger('Places service');
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

  // private getLatLng(coordinatesString: string): CoordinatesDto {
  //   return new CoordinatesDto(coordinatesString);
  // }

  // private filterByCoordinates(
  //   placeCoordinates: string,
  //   searchCoordinates: string,
  //   radius: number,
  // ): boolean {
  //   const origin = this.getLatLng(placeCoordinates);
  //   const search = this.getLatLng(searchCoordinates);
  //
  //   const EarthRadius = 6371; // km
  //   const originLatRadian = (origin.lat * Math.PI) / 180; // origin latitude in radians
  //   const searchLatRadian = (search.lat * Math.PI) / 180; // search latitude in radians
  //   const deltaLatRadian = ((search.lat - origin.lat) * Math.PI) / 180; // delta between latitudes radians
  //   const deltaLngRadian = ((search.lng - origin.lng) * Math.PI) / 180; // delta between longitude radians
  //
  //   const a =
  //     Math.sin(deltaLatRadian / 2) * Math.sin(deltaLatRadian / 2) +
  //     Math.cos(originLatRadian) *
  //       Math.cos(searchLatRadian) *
  //       Math.sin(deltaLngRadian / 2) *
  //       Math.sin(deltaLngRadian / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //
  //   const distance = EarthRadius * c; // in metres
  //   this.logger.debug(
  //     `distance in km between search radius: ${distance - radius}`,
  //   );
  //
  //   return distance <= radius;
  // }

  private selectPlacesQuery(
    qb: SelectQueryBuilder<Place>,
    langId: number,
  ): SelectQueryBuilder<Place> {
    return qb
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
        'place.description',
        'translation',
        'description_t',
        'place.description = description_t.textId AND description_t.language = :langId',
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
      });
  }

  async findAll(langId: number) {
    const qb = this.placesRepository.createQueryBuilder('place');
    return this.selectPlacesQuery(qb, langId).getMany();
  }

  private countTotalPages(totalResults: number, resultsPerPage: number) {
    if (totalResults === 0) return 0;
    if (resultsPerPage === 0)
      throw new BadRequestException({
        message: 'Results per page must be greater than 0',
      });
    const defaultCount = 1;
    return (
      (totalResults - (totalResults % resultsPerPage)) / resultsPerPage ||
      defaultCount
    );
  }

  private generateSelectBaseQuery(langId: number, search: string) {
    let query = this.placesRepository
      .createQueryBuilder('place')
      .select(['place.title', 'place.id'])
      .take(6)
      .leftJoinAndMapOne(
        'place.title',
        'translation',
        'title_t',
        'place.title = title_t.textId AND title_t.language = :langId',
        { langId },
      );
    if (search?.length > 0)
      query = query.where('title_t.text LIKE :search', {
        search: `${search}%`,
      });
    return query;
  }

  async getPlacesSelect(
    tokenPayload: TokenPayloadDto,
    langId: number,
    search: string,
  ) {
    // select places on moderation, that belongs to user
    const userPlaces = await this.generateSelectBaseQuery(langId, search)
      .andWhere('place.author = :userId', { userId: tokenPayload.id })
      .andWhere('place.status = :onModeration', {
        onModeration: PlaceStatusesEnum.MODERATION,
      })
      .getMany();
    // select public places
    const placesSearch = await this.generateSelectBaseQuery(langId, search)
      .andWhere('place.status = :onModeration', {
        onModeration: PlaceStatusesEnum.MODERATION,
      })
      .getMany();

    const filteredSearchPlaces = placesSearch.filter(
      (pSearch) => !userPlaces.map((pUser) => pUser.id).includes(pSearch.id),
    );

    return userPlaces.concat(filteredSearchPlaces);
  }

  private readonly geolocationSQLQuery = `
    geography::Point(
      LEFT(place.coordinates, PATINDEX('%;%', place.coordinates) - 1), 
      RIGHT(place.coordinates, LEN(place.coordinates) - PATINDEX('%;%', place.coordinates)), 
      4326
    ).STDistance(
      geography::Point(
        LEFT(:searchCoordinates, PATINDEX('%;%', :searchCoordinates) - 1), 
        RIGHT(:searchCoordinates, LEN(:searchCoordinates) - PATINDEX('%;%', :searchCoordinates)), 
        4326
      )
    ) 
    <= :radius    
  `;

  async search(
    langId: number,
    searchDto: SearchRequestDto,
  ): Promise<ISearchServiceResponse> {
    try {
      let totalResults = 0;
      let totalPages = 0;
      const limit = searchDto.itemsPerPage;
      const skip = (searchDto.pageToReturn - 1) * limit;
      const isSearchByTitle = searchDto.title?.length > 0;
      // initial query builder to provide base sql request with all joins and mappings
      const initialQb = this.placesRepository
        .createQueryBuilder('place')
        .skip(skip)
        .take(limit);
      const qb = this.selectPlacesQuery(initialQb, langId);
      // if search is by place titles
      if (isSearchByTitle) {
        const resultQueryTitle = qb.where('title_t.text LIKE :title', {
          title: `%${searchDto.title}%`,
        });
        totalResults = await resultQueryTitle.getCount();
        totalPages = this.countTotalPages(totalResults, searchDto.itemsPerPage);
        const places = await resultQueryTitle.getMany();
        return {
          places,
          currentPage: searchDto.pageToReturn,
          totalPages: totalPages,
          totalResults: totalResults,
        };
      }
      let resultQuery = qb;
      // if there is place type filter with > 0 items
      if (searchDto.typesIds && searchDto.typesIds.length > 0) {
        resultQuery = resultQuery.where('type.id IN (:...typeIds)', {
          typeIds: searchDto.typesIds,
        });
      }
      // if there is search circle
      if (searchDto.searchCoordinates) {
        resultQuery = resultQuery.andWhere(this.geolocationSQLQuery, {
          searchCoordinates: searchDto.searchCoordinates,
          radius: searchDto.radius * 1000, // km to meters
        });
      }
      totalResults = await resultQuery.getCount();
      totalPages = this.countTotalPages(totalResults, searchDto.itemsPerPage);
      const places = await resultQuery.getMany();
      // console.log(
      //   searchDto.searchCoordinates,
      //   places[0]?.coordinates,
      //   searchDto.radius * 1000,
      // );
      return {
        places,
        currentPage: searchDto.pageToReturn,
        totalPages: totalPages,
        totalResults: totalResults,
      };
    } catch (e) {
      this.logger.error('Error occured while search request', e);
      throw new BadRequestException({ message: 'Error occured' });
    }
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

  async findSlugExist(slug: string) {
    return await this.placesRepository.exist({
      where: {
        slug: Equal(slug),
      },
    });
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
        status: admin
          ? PlaceStatusesEnum.APPROVED
          : PlaceStatusesEnum.MODERATION,
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
