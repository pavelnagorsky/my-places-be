import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import {
  Between,
  Equal,
  FindManyOptions,
  ILike,
  In,
  LessThanOrEqual,
  Like as LikeOperator,
  MoreThanOrEqual,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CreatePlaceDto } from './dto/create-place.dto';
import { TranslationsService } from '../translations/translations.service';
import { PlaceType } from '../place-types/entities/place-type.entity';
import { PlaceCategory } from '../place-categories/entities/place-category.entity';
import { ImagesService } from '../images/images.service';
import { User } from '../users/entities/user.entity';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { SearchRequestDto } from './dto/search-request.dto';
import { ISearchServiceResponse } from './interfaces';
import { PlaceStatusesEnum } from './enums/place-statuses.enum';
import { CreateSlugDto } from './dto/create-slug.dto';
import { PlaceTranslation } from './entities/place-translation.entity';
import { MyPlacesOrderByEnum } from './enums/my-places-order-by.enum';
import { MyPlacesRequestDto } from './dto/my-places-request.dto';
import { ModerationPlacesRequestDto } from './dto/moderation-places-request.dto';
import { ModerationPlacesOrderByEnum } from './enums/moderation-places-order-by.enum';
import { ModerationDto } from './dto/moderation.dto';

@Injectable()
export class PlacesService {
  private readonly logger = new Logger('Places service');
  constructor(
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(PlaceType)
    private placeTypesRepository: Repository<PlaceType>,
    @InjectRepository(PlaceCategory)
    private placeCategoriesRepository: Repository<PlaceCategory>,
    @InjectRepository(PlaceTranslation)
    private placeTranslationsRepository: Repository<PlaceTranslation>,
    private imagesService: ImagesService,
    private translationsService: TranslationsService,
  ) {}

  // create translations for place
  private async createTranslations(sourceLangId: number, dto: CreatePlaceDto) {
    const allLanguages = await this.translationsService.getAllLanguages();

    const translations: PlaceTranslation[] = [];

    await Promise.all(
      allLanguages.map(async (lang) => {
        // translate titles
        const newTranslation = this.placeTranslationsRepository.create({
          language: {
            id: lang.id,
          },
          title:
            lang.id === sourceLangId
              ? dto.title
              : await this.translationsService.createGoogleTranslation(
                  dto.title,
                  lang.code,
                  sourceLangId,
                ),
          description:
            lang.id === sourceLangId
              ? dto.description
              : await this.translationsService.createGoogleTranslation(
                  dto.description,
                  lang.code,
                  sourceLangId,
                ),
          address:
            lang.id === sourceLangId
              ? dto.address
              : await this.translationsService.createGoogleTranslation(
                  dto.address,
                  lang.code,
                  sourceLangId,
                ),
          original: lang.id === sourceLangId,
        });
        translations.push(newTranslation);
        return;
      }),
    );

    return translations;
  }

  // update place translations
  private async updateTranslations(
    sourceLangId: number,
    place: Place,
    dto: UpdatePlaceDto,
    translateAll: boolean,
  ) {
    const translations: PlaceTranslation[] = [];

    // helper function to merge update translations
    const mergeUpdateTranslations = async (
      arrayToSave: PlaceTranslation[],
      translation: PlaceTranslation,
    ) => {
      const newTranslation = this.placeTranslationsRepository.create({
        id: translation.id,
        language: {
          id: translation.language.id,
        },
        // update if this language was selected in request
        // translate if translateAll option was selected
        // else do not change
        title:
          translation.language.id === sourceLangId
            ? dto.title
            : translateAll
            ? await this.translationsService.createGoogleTranslation(
                dto.title,
                translation.language.code,
                sourceLangId,
              )
            : translation.title,
        description:
          translation.language.id === sourceLangId
            ? dto.description
            : translateAll
            ? await this.translationsService.createGoogleTranslation(
                dto.description,
                translation.language.code,
                sourceLangId,
              )
            : translation.description,
        address:
          translation.language.id === sourceLangId
            ? dto.address
            : translateAll
            ? await this.translationsService.createGoogleTranslation(
                dto.address,
                translation.language.code,
                sourceLangId,
              )
            : translation.address,
        original: translation.language.id === sourceLangId,
      });
      arrayToSave.push(newTranslation);
      return;
    };

    const updateTranslations = place.translations.map(async (translation) => {
      // translate place data
      await mergeUpdateTranslations(translations, translation);
      return;
    });

    await Promise.all(updateTranslations);

    return translations;
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

    const place = this.placesRepository.create({
      originalLanguage: {
        id: langId,
      },
      slug: createPlaceDto.slug,
      translations: translations,
      type: placeType,
      coordinates: createPlaceDto.coordinates,
      categories: placeCategories,
      images: placeImages,
      advertisement: createPlaceDto.isCommercial,
      website: createPlaceDto.website ? createPlaceDto.website : undefined,
      author: author,
    });

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

  private selectPlacesForSearchQuery(
    qb: SelectQueryBuilder<Place>,
    langId: number,
  ): SelectQueryBuilder<Place> {
    return qb
      .where('place.status = :approvedStatus', {
        approvedStatus: PlaceStatusesEnum.APPROVED,
      })
      .leftJoinAndSelect('place.categories', 'categories')
      .leftJoinAndSelect(
        'categories.titles',
        'categoriesTitles',
        'categoriesTitles.language = :langId',
        { langId },
      )
      .leftJoinAndSelect('place.type', 'type')
      .leftJoinAndSelect(
        'type.titles',
        'typeTitles',
        'typeTitles.language = :langId',
        { langId },
      )
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
        'type.image2',
        'image',
        'type_image2',
        'type.image2 = type_image2.id',
      )
      .leftJoinAndMapOne(
        'categories.image',
        'image',
        'categories_image',
        'categories.image = categories_image.id',
      )
      .leftJoinAndSelect(
        'place.translations',
        'placeTranslations',
        'placeTranslations.language = :langId',
        { langId },
      )
      .orderBy({
        'place.createdAt': 'DESC',
        'place.likesCount': 'DESC',
        'place.viewsCount': 'DESC',
      });
  }

  private getPlacesSelectFindOptions(
    langId: number,
    search: string,
  ): FindManyOptions<Place> {
    const shouldApplySearch = search?.length > 0;
    return {
      take: 6,
      relations: {
        translations: true,
      },
      select: {
        id: true,
        translations: {
          title: true,
        },
      },
      where: {
        translations: {
          title: shouldApplySearch ? LikeOperator(`${search}%`) : undefined,
          language: {
            id: langId,
          },
        },
      },
    };
  }

  async getPlacesSelect(
    tokenPayload: AccessTokenPayloadDto,
    langId: number,
    search: string,
    placeId: number | null,
  ) {
    // default sql request options
    const defaultFindOptions = this.getPlacesSelectFindOptions(langId, search);
    // select not published places, that belong to user
    const userPlaces = await this.placesRepository.find({
      ...defaultFindOptions,
      where: {
        ...defaultFindOptions.where,
        author: {
          id: tokenPayload.id,
        },
        status: In([
          PlaceStatusesEnum.MODERATION,
          PlaceStatusesEnum.NEEDS_PAYMENT,
        ]),
      },
    });
    // select published places
    const placesSearch = await this.placesRepository.find({
      ...defaultFindOptions,
      where: {
        ...defaultFindOptions.where,
        status: PlaceStatusesEnum.APPROVED,
      },
    });
    // select place by id
    let placeById: Place | null = null;
    if (placeId) {
      placeById = await this.placesRepository.findOne({
        ...defaultFindOptions,
        where: {
          id: placeId,
        },
      });
    }

    const filteredUserPlaces = userPlaces.filter((p) => p.id !== placeId);
    if (placeById) {
      filteredUserPlaces.unshift(placeById);
    }
    const filteredSearchPlaces = placesSearch.filter(
      (pSearch) =>
        !filteredUserPlaces.map((pUser) => pUser.id).includes(pSearch.id),
    );

    const totalPlaces = filteredUserPlaces.concat(filteredSearchPlaces);

    return totalPlaces;
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

  async search(langId: number, searchDto: SearchRequestDto) {
    try {
      // let totalResults = 0;
      // let totalPages = 0;
      const isSearchByTitle = searchDto.title?.length > 0;
      // initial query builder to provide base sql request with all joins and mappings
      const initialQb = this.placesRepository
        .createQueryBuilder('place')
        .skip(searchDto.pageSize * searchDto.page)
        .take(searchDto.pageSize);
      const qb = this.selectPlacesForSearchQuery(initialQb, langId);
      // if search is by place titles
      if (isSearchByTitle) {
        const resultQueryTitle = qb.where(
          'placeTranslations.title LIKE :title',
          {
            title: `%${searchDto.title}%`,
          },
        );
        const result = await resultQueryTitle.getManyAndCount();
        return result;
      }
      let resultQuery = qb;
      // if there is place type filter with > 0 items
      if (searchDto.typesIds && searchDto.typesIds.length > 0) {
        resultQuery = resultQuery.andWhere('type.id IN (:...typeIds)', {
          typeIds: searchDto.typesIds,
        });
      }
      // if there is place categories filter - check if at least one of them matches filter
      if (searchDto.categoriesIds && searchDto.categoriesIds.length > 0) {
        resultQuery = resultQuery.andWhere(
          (qb) => `(${qb
            .createQueryBuilder()
            .select('COUNT(*)')
            .from('place_categories_place_category', 'relationCategories')
            .where('relationCategories.placeId = place.id')
            .andWhere('relationCategories.placeCategoryId IN (:...categoryIds)')
            .getSql()})
            > 0`,
          {
            categoryIds: searchDto.categoriesIds,
          },
        );
      }
      // if there is search circle
      if (searchDto.searchCoordinates) {
        resultQuery = resultQuery.andWhere(this.geolocationSQLQuery, {
          searchCoordinates: searchDto.searchCoordinates,
          radius: searchDto.radius * 1000, // km to meters
        });
      }
      // console.log(resultQuery.getSql());
      // console.log(
      //   searchDto.searchCoordinates,
      //   places[0]?.coordinates,
      //   searchDto.radius * 1000,
      // );
      const result = await resultQuery.getManyAndCount();
      return result;
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

  async checkExist(placeId: number): Promise<boolean> {
    return this.placesRepository.exist({
      where: {
        id: Equal(placeId),
      },
    });
  }

  async findOneBySlug(slug: string, langId: number) {
    const place = await this.placesRepository.findOne({
      relations: {
        translations: true,
        type: {
          titles: true,
          image: true,
          image2: true,
        },
        categories: {
          titles: true,
          image: true,
          image2: true,
        },
        images: true,
      },
      where: {
        status: PlaceStatusesEnum.APPROVED,
        slug: Equal(slug),
        translations: {
          language: {
            id: langId,
          },
        },
        type: {
          titles: {
            language: {
              id: langId,
            },
          },
        },
        // categories: {
        //   titles: {
        //     language: {
        //       id: langId,
        //     },
        //   },
        // },
      },
      order: {
        images: {
          position: 'ASC',
        },
      },
    });
    if (!place) throw new NotFoundException({ message: 'Place not found' });
    this.addView(place.id);
    return place;
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
      .where('place.status = :approvedStatus', {
        approvedStatus: PlaceStatusesEnum.APPROVED,
      })
      .select(['place.id', 'place.slug'])
      .getMany();
  }

  async validateSlug(createSlugDto: CreateSlugDto) {
    return await this.placesRepository.exist({
      where: {
        slug: Equal(createSlugDto.slug),
        id: createSlugDto.id ? Not(createSlugDto.id) : undefined,
      },
    });
  }

  async updatePlace(
    placeId: number,
    langId: number,
    updatePlaceDto: UpdatePlaceDto,
  ) {
    try {
      const oldPlace = await this.placesRepository.findOne({
        relations: {
          translations: {
            language: true,
          },
        },
        where: {
          id: placeId,
        },
      });
      if (!oldPlace)
        throw new BadRequestException({ message: 'Place not exists' });

      const placeType = await this.validatePlaceType(updatePlaceDto);
      const placeCategories = await this.validatePlaceCategories(
        updatePlaceDto,
      );

      const placeImages = await this.imagesService.updatePositions(
        updatePlaceDto.imagesIds,
      );

      const translations = await this.updateTranslations(
        langId,
        oldPlace,
        updatePlaceDto,
        updatePlaceDto.shouldTranslate,
      );

      const updatedPlace = this.placesRepository.create({
        id: placeId,
        slug: updatePlaceDto.slug,
        originalLanguage: {
          id: langId,
        },
        images: placeImages,
        translations: translations,
        type: placeType,
        coordinates: updatePlaceDto.coordinates,
        categories: placeCategories,
        website: updatePlaceDto.website,
        status: PlaceStatusesEnum.MODERATION,
        advertisement: updatePlaceDto.isCommercial,
        moderationMessage: null,
      });

      await this.placesRepository.save(updatedPlace);

      return { id: placeId };
    } catch (e) {
      this.logger.error(e);
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new BadRequestException({ message: 'Incorrect details' });
    }
  }

  async removePlace(id: number) {
    const deleted = await this.placesRepository.remove(
      this.placesRepository.create({ id }),
    );
    return { id };
  }

  async findMyPlaces(
    langId: number,
    dto: MyPlacesRequestDto,
    tokenPayload: AccessTokenPayloadDto,
  ) {
    const orderDirection = dto.orderAsc ? 'ASC' : 'DESC';

    const getDateWhereOption = () => {
      if (!!dto.dateFrom && !!dto.dateTo)
        return Between(new Date(dto.dateFrom), new Date(dto.dateTo));
      if (!!dto.dateFrom) return MoreThanOrEqual(new Date(dto.dateFrom));
      if (!!dto.dateTo) return LessThanOrEqual(new Date(dto.dateTo));
      return undefined;
    };

    const res = await this.placesRepository.findAndCount({
      relations: {
        translations: true,
        type: {
          titles: true,
        },
      },
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      order: {
        createdAt:
          dto.orderBy === MyPlacesOrderByEnum.CREATED_AT || !dto.orderBy
            ? orderDirection
            : undefined,
        translations: {
          title:
            dto.orderBy === MyPlacesOrderByEnum.TITLE
              ? orderDirection
              : undefined,
        },
        type: {
          titles: {
            text:
              dto.orderBy === MyPlacesOrderByEnum.TYPE
                ? orderDirection
                : undefined,
          },
        },
        status:
          dto.orderBy === MyPlacesOrderByEnum.STATUS
            ? orderDirection
            : undefined,
        advertisement:
          dto.orderBy === MyPlacesOrderByEnum.COMMERCIAL
            ? orderDirection
            : undefined,
      },
      select: {
        id: true,
        translations: {
          title: true,
        },
        moderationMessage: true,
        advEndDate: true,
        viewsCount: true,
        status: true,
        slug: true,
        advertisement: true,
        comments: true,
        createdAt: true,
        updatedAt: true,
        likesCount: true,
      },
      loadRelationIds: {
        relations: ['comments', 'reviews'],
      },
      where: {
        author: {
          id: tokenPayload.id,
        },
        type: {
          titles: {
            language: {
              id: langId,
            },
          },
        },
        createdAt: getDateWhereOption(),
        status:
          !!dto.statuses && dto.statuses?.length > 0
            ? In(dto.statuses)
            : undefined,
        translations: {
          title:
            !!dto.search && dto.search.length > 0
              ? ILike(`${dto.search}%`)
              : undefined,
          language: {
            id: langId,
          },
        },
      },
    });

    return res;
  }

  async getPlaceForModeration(id: number) {
    const place = await this.placesRepository.findOne({
      relations: {
        originalLanguage: true,
      },
      select: {
        originalLanguage: {
          id: true,
        },
        id: true,
      },
      where: { id: id },
    });

    return await this.getPlaceForEdit(id, place?.originalLanguage?.id || 1);
  }

  async getPlaceForEdit(id: number, langId: number) {
    const place = await this.placesRepository.findOne({
      relations: {
        translations: true,
        images: true,
      },
      loadRelationIds: {
        relations: ['categories', 'type'],
      },
      where: {
        id: id,
        translations: {
          language: {
            id: langId,
          },
        },
      },
      order: {
        images: {
          position: 'ASC',
        },
      },
    });
    if (!place) throw new NotFoundException({ message: 'Place not found' });
    return place;
  }

  async findModerationPlaces(langId: number, dto: ModerationPlacesRequestDto) {
    const orderDirection = dto.orderAsc ? 'ASC' : 'DESC';

    const getDateWhereOption = () => {
      if (!!dto.dateFrom && !!dto.dateTo)
        return Between(new Date(dto.dateFrom), new Date(dto.dateTo));
      if (!!dto.dateFrom) return MoreThanOrEqual(new Date(dto.dateFrom));
      if (!!dto.dateTo) return LessThanOrEqual(new Date(dto.dateTo));
      return undefined;
    };

    const res = await this.placesRepository.findAndCount({
      relations: {
        translations: true,
        type: {
          titles: true,
        },
        author: true,
      },
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      order: {
        createdAt:
          dto.orderBy === ModerationPlacesOrderByEnum.CREATED_AT
            ? orderDirection
            : undefined,
        updatedAt:
          dto.orderBy === ModerationPlacesOrderByEnum.UPDATED_AT || !dto.orderBy
            ? orderDirection
            : undefined,
        translations: {
          title:
            dto.orderBy === ModerationPlacesOrderByEnum.TITLE
              ? orderDirection
              : undefined,
        },
        type: {
          titles: {
            text:
              dto.orderBy === ModerationPlacesOrderByEnum.TYPE
                ? orderDirection
                : undefined,
          },
        },
        advertisement:
          dto.orderBy === ModerationPlacesOrderByEnum.COMMERCIAL
            ? orderDirection
            : undefined,
        author: {
          firstName:
            dto.orderBy === ModerationPlacesOrderByEnum.AUTHOR
              ? orderDirection
              : undefined,
          lastName:
            dto.orderBy === ModerationPlacesOrderByEnum.AUTHOR
              ? orderDirection
              : undefined,
        },
      },
      select: {
        id: true,
        translations: {
          title: true,
        },
        author: {
          firstName: true,
          lastName: true,
          email: true,
        },
        slug: true,
        advertisement: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        author: {
          email: dto.authorEmail ? ILike(`${dto.authorEmail}%`) : undefined,
        },
        type: {
          titles: {
            language: {
              id: langId,
            },
          },
        },
        updatedAt: getDateWhereOption(),
        status: PlaceStatusesEnum.MODERATION,
        translations: {
          title:
            !!dto.search && dto.search.length > 0
              ? ILike(`${dto.search}%`)
              : undefined,
          language: {
            id: langId,
          },
        },
      },
    });

    return res;
  }

  async moderatePlace(placeId: number, dto: ModerationDto, moderator: User) {
    const place = await this.placesRepository.findOne({
      where: {
        id: placeId,
      },
      select: {
        id: true,
        advertisement: true,
      },
    });
    if (!place)
      throw new NotFoundException({
        message: 'Place not found',
      });

    await this.placesRepository.save({
      id: place.id,
      moderator: moderator,
      status: dto.accept
        ? place.advertisement
          ? PlaceStatusesEnum.NEEDS_PAYMENT
          : PlaceStatusesEnum.APPROVED
        : PlaceStatusesEnum.REJECTED,
      moderationMessage: dto.feedback || null,
    });
    return;
  }
}
