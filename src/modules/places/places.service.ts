import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import {
  And,
  Between,
  Equal,
  FindManyOptions,
  ILike,
  In,
  IsNull,
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
import { PlaceStatusesEnum } from './enums/place-statuses.enum';
import { PlaceTranslation } from './entities/place-translation.entity';
import { MyPlacesOrderByEnum } from './enums/my-places-order-by.enum';
import { MyPlacesRequestDto } from './dto/my-places-request.dto';
import { ModerationPlacesRequestDto } from './dto/moderation-places-request.dto';
import { ModerationPlacesOrderByEnum } from './enums/moderation-places-order-by.enum';
import { ModerationDto } from './dto/moderation.dto';
import { LanguageIdEnum } from '../languages/enums/language-id.enum';
import { MailingService } from '../mailing/mailing.service';
import { PlaceEmail } from '../mailing/emails/place.email';
import { PlaceForEmailDto } from './dto/place-for-email.dto';
import { ChangePlaceStatusDto } from './dto/change-place-status.dto';
import { Review } from '../reviews/entities/review.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SearchService } from '../search/search.service';

@Injectable()
export class PlacesService {
  private readonly logger = new Logger('Places service');
  constructor(
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(PlaceType)
    private placeTypesRepository: Repository<PlaceType>,
    @InjectRepository(PlaceCategory)
    private placeCategoriesRepository: Repository<PlaceCategory>,
    @InjectRepository(PlaceTranslation)
    private placeTranslationsRepository: Repository<PlaceTranslation>,
    private imagesService: ImagesService,
    private translationsService: TranslationsService,
    private mailingService: MailingService,
    private searchService: SearchService,
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

  async validateSlugExists(slug: string, placeId?: number) {
    return this.placesRepository.exists({
      where: {
        slug: Equal(slug),
        id: placeId ? Not(placeId) : undefined,
      },
    });
  }

  private async createValidSlug(text: string, placeId?: number) {
    let validatedSlug = this.translationsService.parseToSlug(text);
    let success = false;
    let i = 0;
    while (!success && i < 10) {
      i += 1;
      const slugExists = await this.validateSlugExists(validatedSlug, placeId);
      if (!slugExists) {
        success = true;
      } else {
        if (i > 1) {
          validatedSlug = validatedSlug.slice(0, -1) + i;
        } else {
          validatedSlug = `${validatedSlug}-${i}`;
        }
      }
    }
    if (!success) {
      throw new BadRequestException({
        message: 'Invalid slug',
      });
    }
    return validatedSlug;
  }

  async create(langId: number, author: User, createPlaceDto: CreatePlaceDto) {
    const placeType = await this.validatePlaceType(createPlaceDto);
    const placeCategories = await this.validatePlaceCategories(createPlaceDto);

    const placeImages = await this.imagesService.updatePositions(
      createPlaceDto.imagesIds,
    );

    const detectedLanguageId =
      await this.translationsService.getLanguageIdOfText(createPlaceDto.title);
    const translations = await this.createTranslations(
      detectedLanguageId || langId,
      createPlaceDto,
    );
    const titleTranslationRu =
      translations.find((tr) => tr.language.id === LanguageIdEnum.RU)?.title ||
      createPlaceDto.title;
    const parsedSlug = await this.createValidSlug(titleTranslationRu);

    const place = this.placesRepository.create({
      originalLanguage: {
        id: detectedLanguageId || langId,
      },
      slug: parsedSlug,
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

  async updatePlaceSlug(placeId: number, slug: string) {
    const placeExists = await this.checkExist(placeId);
    if (!placeExists) {
      throw new NotFoundException({ message: 'Place not exists' });
    }
    await this.placesRepository.save({
      id: placeId,
      slug: slug,
    });
    this.searchService.updatePlaceInCache(placeId);
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
          title: shouldApplySearch ? LikeOperator(`%${search}%`) : undefined,
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
          translations: {
            language: {
              id: langId,
            },
          },
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

  private async addView(placeId: number) {
    return this.placesRepository
      .createQueryBuilder()
      .update()
      .set({ viewsCount: () => 'viewsCount + 1' })
      .where({ id: Equal(placeId) })
      .execute();
  }

  async checkExist(placeId: number): Promise<boolean> {
    return this.placesRepository.exists({
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
    return await this.placesRepository.exists({
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

  async updatePlace(
    placeId: number,
    langId: number,
    updatePlaceDto: UpdatePlaceDto,
    byAdmin = false,
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

      const detectedLanguageId =
        await this.translationsService.getLanguageIdOfText(
          updatePlaceDto.title,
        );
      const translations = await this.updateTranslations(
        detectedLanguageId || langId,
        oldPlace,
        updatePlaceDto,
        updatePlaceDto.shouldTranslate,
      );

      const updatedPlace = this.placesRepository.create({
        id: placeId,
        originalLanguage: {
          id: detectedLanguageId || langId,
        },
        images: placeImages,
        translations: translations,
        type: placeType,
        coordinates: updatePlaceDto.coordinates,
        categories: placeCategories,
        website: updatePlaceDto.website,
        advertisement: updatePlaceDto.isCommercial,
      });
      if (!updatePlaceDto.isCommercial) {
        updatedPlace.advEndDate = null;
      }
      if (!byAdmin) {
        updatedPlace.status = PlaceStatusesEnum.MODERATION;
        updatedPlace.moderationMessage = null;
      }

      await this.placesRepository.save(updatedPlace);
      this.searchService.updatePlaceInCache(placeId);

      return {
        id: placeId,
      };
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
    this.searchService.updatePlaceInCache(id);
    return { id };
  }

  async getPlaceShortInfo(id: number, langId: number) {
    const res = await this.placesRepository.findOne({
      relations: {
        translations: true,
        type: {
          titles: true,
        },
        author: true,
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
        id: id,
        type: {
          titles: {
            language: {
              id: langId,
            },
          },
        },
        translations: {
          language: {
            id: langId,
          },
        },
      },
    });

    return res;
  }

  async findMyPlaces(
    langId: number,
    dto: MyPlacesRequestDto,
    tokenPayload?: AccessTokenPayloadDto,
  ) {
    const orderDirection = dto.orderAsc ? 'ASC' : 'DESC';

    const getDateWhereOption = () => {
      if (!!dto.dateFrom && !!dto.dateTo)
        return Between(new Date(dto.dateFrom), new Date(dto.dateTo));
      if (!!dto.dateFrom) return MoreThanOrEqual(new Date(dto.dateFrom));
      if (!!dto.dateTo) return LessThanOrEqual(new Date(dto.dateTo));
      return undefined;
    };

    const authorWhereStatement =
      tokenPayload?.id ?? (!!dto.userIds?.length ? In(dto.userIds) : undefined);

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
          id: authorWhereStatement,
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
              ? ILike(`%${dto.search}%`)
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

    return await this.getPlaceForEdit(
      id,
      place?.originalLanguage?.id || LanguageIdEnum.RU,
    );
  }

  private async getPlaceForEmail(id: number) {
    const place = await this.placesRepository.findOne({
      relations: {
        translations: true,
        author: true,
      },
      select: {
        id: true,
        createdAt: true,
        advertisement: true,
        status: true,
        author: {
          email: true,
          firstName: true,
          lastName: true,
          receiveEmails: true,
        },
        advEndDate: true,
      },
      where: {
        id: id,
        translations: {
          language: {
            id: LanguageIdEnum.RU,
          },
        },
      },
    });
    return place;
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

  async changePlaceStatus(id: number, dto: ChangePlaceStatusDto) {
    const place = await this.placesRepository.findOne({ where: { id: id } });
    if (!place) throw new NotFoundException({ message: 'Place not found' });
    const statusChanged = place.status !== dto.status;
    const isCommercialChanged = place.advertisement !== dto.advertisement;

    // update status
    place.status = dto.status;
    if (dto.status === PlaceStatusesEnum.REJECTED)
      place.moderationMessage = dto.message || '';
    // update commercial
    place.advertisement = dto.advertisement;
    if (dto.advEndDate) place.advEndDate = new Date(dto.advEndDate);
    if (
      [
        PlaceStatusesEnum.COMMERCIAL_EXPIRED,
        PlaceStatusesEnum.NEEDS_PAYMENT,
      ].includes(dto.status) ||
      !dto.advertisement
    ) {
      place.advEndDate = null;
    }
    await this.placesRepository.save(place);
    this.searchService.updatePlaceInCache(id);

    const placeForEmail = await this.getPlaceForEmail(id);
    if (!placeForEmail || !placeForEmail.author.receiveEmails) return;

    const email = new PlaceEmail(
      statusChanged
        ? {
            comment: dto.message,
            status: dto.status,
          }
        : isCommercialChanged
        ? { comment: dto.message, advertisement: dto.advertisement }
        : {
            advDateChangedOnly: true,
            comment: dto.message,
          },
      new PlaceForEmailDto(placeForEmail),
    );
    await this.mailingService.sendEmail(email);
  }

  async moderatePlace(placeId: number, dto: ModerationDto, moderator: User) {
    const place = await this.placesRepository.findOne({
      where: {
        id: placeId,
      },
      select: {
        id: true,
        advertisement: true,
        advEndDate: true,
      },
    });
    if (!place)
      throw new NotFoundException({
        message: 'Place not found',
      });

    const updatedStatus = dto.accept
      ? place.advertisement
        ? place.advEndDate
          ? PlaceStatusesEnum.APPROVED
          : PlaceStatusesEnum.NEEDS_PAYMENT
        : PlaceStatusesEnum.APPROVED
      : PlaceStatusesEnum.REJECTED;

    await this.placesRepository.save({
      id: place.id,
      moderator: moderator,
      status: updatedStatus,
      moderationMessage: dto.feedback || null,
    });
    this.searchService.updatePlaceInCache(placeId);

    // send email
    const placeForEmail = await this.getPlaceForEmail(place.id);
    if (!placeForEmail || !placeForEmail.author.receiveEmails) return;
    const email = new PlaceEmail(
      {
        status: updatedStatus,
        comment: dto.feedback,
      },
      new PlaceForEmailDto(placeForEmail),
    );
    this.mailingService.sendEmail(email);
  }

  async deletePlaceAdministration(id: number, newPlaceIdForReviews?: number) {
    if (newPlaceIdForReviews) {
      await this.reviewsRepository.update(
        { place: { id: id } },
        { place: { id: newPlaceIdForReviews } },
      );
    }
    await this.removePlace(id);
    this.searchService.updatePlaceInCache(id);
  }

  // Cron job for moving commercial places with outdated adv end date into waiting for payment status
  @Cron(CronExpression.EVERY_12_HOURS)
  private async handleCommercialOutdatedPlaces() {
    const places = await this.placesRepository.find({
      relations: {
        translations: true,
        author: true,
      },
      select: {
        id: true,
        createdAt: true,
        advertisement: true,
        status: true,
        author: {
          email: true,
          firstName: true,
          lastName: true,
          receiveEmails: true,
        },
        advEndDate: true,
      },
      where: {
        translations: {
          language: {
            id: LanguageIdEnum.RU,
          },
        },
        advertisement: true,
        advEndDate: And(Not(IsNull()), LessThanOrEqual(new Date())),
      },
    });
    places.forEach(async (p) => {
      try {
        p.status = PlaceStatusesEnum.NEEDS_PAYMENT;
        p.advEndDate = null;
        await this.placesRepository.save(p);
        this.searchService.updatePlaceInCache(p.id);

        if (!p.author.receiveEmails) return;
        const email = new PlaceEmail(
          { status: PlaceStatusesEnum.NEEDS_PAYMENT },
          new PlaceForEmailDto(p),
        );
        this.mailingService.sendEmail(email);
      } catch (e) {
        this.logger.error(
          'Cron job: Failed to handleCommercialOutdatedPlaces',
          e,
        );
      }
    });
  }

  // Cron job for sending notification emails with info that commercial ends in a week
  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  private async handleCommercialNotifications() {
    const currentDate = new Date();
    const oneWeekFromNow = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    const places = await this.placesRepository.find({
      relations: {
        translations: true,
        author: true,
      },
      select: {
        id: true,
        createdAt: true,
        advertisement: true,
        status: true,
        author: {
          email: true,
          firstName: true,
          lastName: true,
          receiveEmails: true,
        },
        advEndDate: true,
      },
      where: {
        translations: {
          language: {
            id: LanguageIdEnum.RU,
          },
        },
        advertisement: true,
        advEndDate: And(
          Not(IsNull()),
          Equal(
            new Date(
              oneWeekFromNow.getFullYear(),
              oneWeekFromNow.getMonth(),
              oneWeekFromNow.getDate(),
            ),
          ),
        ),
      },
    });
    places.forEach((p) => {
      if (!p.author.receiveEmails) return;
      const email = new PlaceEmail(
        { commercialExpires: true },
        new PlaceForEmailDto(p),
      );
      this.mailingService.sendEmail(email);
    });
  }
}
