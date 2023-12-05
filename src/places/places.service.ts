import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import {
  Equal,
  FindManyOptions,
  In,
  Like as LikeOperator,
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
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { SearchRequestDto } from './dto/search-request.dto';
import { ISearchServiceResponse } from './interfaces';
import { PlaceStatusesEnum } from './enums/place-statuses.enum';
import { CreateSlugDto } from './dto/create-slug.dto';
import { PlaceTitleTranslation } from './entities/place-title-translation.entity';
import { PlaceDescriptionTranslation } from './entities/place-description-translation.entity';
import { PlaceAddressTranslation } from './entities/place-address-translation.entity';
import { ITranslation } from '../translations/interfaces/translation.interface';

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
    @InjectRepository(PlaceTitleTranslation)
    private titleTranslationsRepository: Repository<PlaceTitleTranslation>,
    @InjectRepository(PlaceDescriptionTranslation)
    private descriptionTranslationsRepository: Repository<PlaceDescriptionTranslation>,
    @InjectRepository(PlaceAddressTranslation)
    private addressTranslationsRepository: Repository<PlaceAddressTranslation>,
    private imagesService: ImagesService,
    private translationsService: TranslationsService,
  ) {}

  // create translations for place
  private async createTranslations(sourceLangId: number, dto: CreatePlaceDto) {
    const allLanguages = await this.translationsService.getAllLanguages();

    const titleTranslations: PlaceTitleTranslation[] = [];
    const descriptionTranslations: PlaceDescriptionTranslation[] = [];
    const addressTranslations: PlaceAddressTranslation[] = [];

    await Promise.all(
      allLanguages.map(async (lang) => {
        // translate titles
        const newTitleTranslation = this.titleTranslationsRepository.create({
          language: {
            id: lang.id,
          },
          text:
            lang.id === sourceLangId
              ? dto.title
              : await this.translationsService.createGoogleTranslation(
                  dto.title,
                  lang.code,
                  sourceLangId,
                ),
          original: lang.id === sourceLangId,
        });
        titleTranslations.push(newTitleTranslation);

        // translate descriptions
        const newDescriptionTranslation =
          this.descriptionTranslationsRepository.create({
            language: {
              id: lang.id,
            },
            text:
              lang.id === sourceLangId
                ? dto.description
                : await this.translationsService.createGoogleTranslation(
                    dto.description,
                    lang.code,
                    sourceLangId,
                  ),
            original: lang.id === sourceLangId,
          });
        descriptionTranslations.push(newDescriptionTranslation);

        // translate addresses
        const newAddressTranslation =
          this.descriptionTranslationsRepository.create({
            language: {
              id: lang.id,
            },
            text:
              lang.id === sourceLangId
                ? dto.address
                : await this.translationsService.createGoogleTranslation(
                    dto.address,
                    lang.code,
                    sourceLangId,
                  ),
            original: lang.id === sourceLangId,
          });
        addressTranslations.push(newAddressTranslation);
        return;
      }),
    );

    return {
      titleTranslations,
      descriptionTranslations,
      addressTranslations,
    };
  }

  // update place translations
  private async updateTranslations(
    sourceLangId: number,
    place: Place,
    dto: UpdatePlaceDto,
    translateAll: boolean,
  ) {
    const titleTranslations: PlaceTitleTranslation[] = [];
    const descriptionTranslations: PlaceDescriptionTranslation[] = [];
    const addressTranslations: PlaceAddressTranslation[] = [];

    // helper function to merge update translations
    const mergeUpdateTranslations = async (
      arrayToSave: ITranslation[],
      translation: ITranslation,
      repository: Repository<ITranslation>,
    ) => {
      const newTranslation = repository.create({
        id: translation.id,
        language: {
          id: translation.language.id,
        },
        // update if this language was selected in request
        // translate if translateAll option was selected
        // else do not change
        text:
          translation.language.id === sourceLangId
            ? dto.title
            : translateAll
            ? await this.translationsService.createGoogleTranslation(
                dto.title,
                translation.language.code,
                sourceLangId,
              )
            : translation.text,
        original: translation.language.id === sourceLangId,
      });
      arrayToSave.push(newTranslation);
      return;
    };

    const updateTitleTranslations = place.titles.map(async (translation) => {
      // translate titles
      await mergeUpdateTranslations(
        titleTranslations,
        translation,
        this.titleTranslationsRepository,
      );
      return;
    });
    const updateDescriptionTranslations = place.descriptions.map(
      async (translation) => {
        // translate titles
        await mergeUpdateTranslations(
          descriptionTranslations,
          translation,
          this.descriptionTranslationsRepository,
        );
        return;
      },
    );
    const updateAddressTranslations = place.addresses.map(
      async (translation) => {
        // translate titles
        await mergeUpdateTranslations(
          addressTranslations,
          translation,
          this.addressTranslationsRepository,
        );
        return;
      },
    );

    await Promise.all([
      Promise.all(updateTitleTranslations),
      Promise.all(updateDescriptionTranslations),
      Promise.all(updateAddressTranslations),
    ]);

    return {
      titleTranslations,
      descriptionTranslations,
      addressTranslations,
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
    place.titles = translations.titleTranslations;
    place.descriptions = translations.descriptionTranslations;
    place.addresses = translations.addressTranslations;
    place.type = placeType;
    place.coordinates = createPlaceDto.coordinates;
    place.categories = placeCategories;
    place.images = placeImages;
    place.advertisement = createPlaceDto.isCommercial;
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

  private selectPlacesForSearchQuery(
    qb: SelectQueryBuilder<Place>,
    langId: number,
  ): SelectQueryBuilder<Place> {
    return qb
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
        'categories.image',
        'image',
        'categories_image',
        'categories.image = categories_image.id',
      )
      .leftJoinAndSelect(
        'place.descriptions',
        'placeDescriptions',
        'placeDescriptions.language = :langId',
        { langId },
      )
      .leftJoinAndSelect(
        'place.titles',
        'placeTitles',
        'placeTitles.language = :langId',
        { langId },
      )
      .leftJoinAndSelect(
        'place.addresses',
        'placeAddresses',
        'placeAddresses.language = :langId',
        { langId },
      )
      .orderBy({
        'place.createdAt': 'DESC',
        'place.likesCount': 'DESC',
        'place.viewsCount': 'DESC',
      });
  }

  private countTotalPages(totalResults: number, resultsPerPage: number) {
    if (totalResults === 0) return 0;
    if (resultsPerPage === 0)
      throw new BadRequestException({
        message: 'Results per page must be greater than 0',
      });
    const defaultCount = 1;
    return Math.ceil(totalResults / resultsPerPage) || defaultCount;
  }

  private getPlacesSelectFindOptions(
    langId: number,
    search: string,
  ): FindManyOptions<Place> {
    const shouldApplySearch = search?.length > 0;
    return {
      take: 6,
      relations: {
        titles: true,
      },
      select: {
        id: true,
        titles: {
          text: true,
        },
      },
      where: {
        titles: {
          text: shouldApplySearch ? LikeOperator(`${search}%`) : undefined,
          language: {
            id: langId,
          },
        },
      },
    };
  }

  async getPlacesSelect(
    tokenPayload: TokenPayloadDto,
    langId: number,
    search: string,
    placeId: number | null,
  ) {
    // default sql request options
    const defaultFindOptions = this.getPlacesSelectFindOptions(langId, search);
    // select places on moderation, that belongs to user
    const userPlaces = await this.placesRepository.find({
      ...defaultFindOptions,
      where: {
        ...defaultFindOptions.where,
        author: {
          id: tokenPayload.id,
        },
        status: PlaceStatusesEnum.MODERATION,
      },
    });
    // select public places
    const placesSearch = await this.placesRepository.find({
      ...defaultFindOptions,
      where: {
        ...defaultFindOptions.where,
        status: PlaceStatusesEnum.MODERATION,
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
      const qb = this.selectPlacesForSearchQuery(initialQb, langId);
      // if search is by place titles
      if (isSearchByTitle) {
        const resultQueryTitle = qb.where('placeTitles.text LIKE :title', {
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
      totalResults = await resultQuery.getCount();
      totalPages = this.countTotalPages(totalResults, searchDto.itemsPerPage);
      // console.log(resultQuery.getSql());
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
        titles: true,
        descriptions: true,
        addresses: true,
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
        slug: Equal(slug),
        titles: {
          language: {
            id: langId,
          },
        },
        descriptions: {
          language: {
            id: langId,
          },
        },
        addresses: {
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
        categories: {
          titles: {
            language: {
              id: langId,
            },
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
          titles: {
            language: true,
          },
          descriptions: {
            language: true,
          },
          addresses: {
            language: true,
          },
        },
        where: { id: placeId },
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
        images: placeImages,
        titles: translations.titleTranslations,
        descriptions: translations.descriptionTranslations,
        addresses: translations.addressTranslations,
        type: placeType,
        coordinates: updatePlaceDto.coordinates,
        categories: placeCategories,
        website: updatePlaceDto.website,
        status: PlaceStatusesEnum.MODERATION,
        advertisement: updatePlaceDto.isCommercial,
      });

      await this.placesRepository.save(updatedPlace);

      return { id: placeId };
    } catch (e) {
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
    itemsPerPage: number,
    lastIndex: number,
    tokenPayload: TokenPayloadDto,
  ) {
    const res = await this.placesRepository.findAndCount({
      relations: {
        titles: true,
        type: {
          titles: true,
        },
      },
      skip: lastIndex,
      take: itemsPerPage,
      order: {
        updatedAt: 'DESC',
      },
      select: {
        id: true,
        titles: true,
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
        relations: ['comments'],
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
        titles: {
          language: {
            id: langId,
          },
        },
      },
    });

    return res;
  }
}
