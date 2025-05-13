import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CreateExcursionDto } from "./dto/create-excursion.dto";
import { UpdateExcursionDto } from "./dto/update-excursion.dto";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Between,
  Brackets,
  Equal,
  ILike,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from "typeorm";
import { Place } from "../places/entities/place.entity";
import { User } from "../users/entities/user.entity";
import { Excursion } from "./entities/excursion.entity";
import { ExcursionPlace } from "./entities/excursion-place.entity";
import { ExcursionTranslation } from "./entities/excursion-translation.entity";
import { ExcursionPlaceTranslation } from "./entities/excursion-place-translation.entity";
import { PlaceStatusesEnum } from "../places/enums/place-statuses.enum";
import { GoogleMapsService } from "../google-maps/google-maps.service";
import { TranslationsService } from "../translations/translations.service";
import { MailingService } from "../mailing/mailing.service";
import { CreateExcursionPlaceDto } from "./dto/create-excursion-place.dto";
import { ExcursionStatusesEnum } from "./enums/excursion-statuses.enum";
import { LanguageIdEnum } from "../languages/enums/language-id.enum";
import { ExcursionsListOrderByEnum } from "./enums/excursions-list-order-by.enum";
import { ExcursionsListRequestDto } from "./dto/excursions-list-request.dto";
import { ReviewStatusesEnum } from "../reviews/enums/review-statuses.enum";
import { ExcursionsModerationListRequestDto } from "./dto/excursions-moderation-list-request.dto";
import { ExcursionsModerationListOrderByEnum } from "./enums/excursions-moderation-list-order-by.enum";
import { ModerationDto } from "../places/dto/moderation.dto";
import { ChangeExcursionStatusDto } from "./dto/change-excursion-status.dto";
import { ExcursionEmail } from "../mailing/emails/excursion.email";
import { ExcursionForEmailDto } from "./dto/excursion-for-email.dto";
import { ExcursionsSearchRequestDto } from "./dto/excursions-search-request.dto";
import { ExcursionsSearchOrderByEnum } from "./enums/excursions-search-order-by.enum";

@Injectable()
export class ExcursionsService {
  private readonly logger = new Logger("Search service");
  constructor(
    @InjectRepository(Excursion)
    private excursionsRepository: Repository<Excursion>,
    @InjectRepository(ExcursionTranslation)
    private excursionTranslationsRepository: Repository<ExcursionTranslation>,
    @InjectRepository(ExcursionPlace)
    private excursionPlacesRepository: Repository<ExcursionPlace>,
    @InjectRepository(ExcursionPlaceTranslation)
    private excursionPlaceTranslationsRepository: Repository<ExcursionPlaceTranslation>,
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    private readonly googleMapsService: GoogleMapsService,
    private translationsService: TranslationsService,
    private mailingService: MailingService
  ) {}

  async create(dto: CreateExcursionDto, langId: number, user: User) {
    const places = await this.getPlacesByIds(
      dto.places.map((place) => place.id)
    );
    const waypoints = places.slice(1, -1).map((place) => place.coordinates);
    const routeDetails = await this.googleMapsService.getRouteDetails(
      places[0].coordinates,
      places[places.length - 1].coordinates,
      waypoints,
      dto.travelMode
    );
    const detectedLanguageId =
      await this.translationsService.getLanguageIdOfText(dto.description);
    const excursionTranslations = await this.createExcursionTranslations(
      detectedLanguageId || langId,
      dto
    );

    const excursionPlacesTranslations = await Promise.all(
      dto.places.map((placeDto) =>
        this.createExcursionPlaceTranslations(
          detectedLanguageId || langId,
          placeDto
        )
      )
    );
    const excursionPlaces = await this.excursionPlacesRepository.save(
      dto.places.map((placeDto, index) => {
        const distance =
          index === 0 ? 0 : routeDetails.distanceLegs[index - 1] ?? 0;
        const duration =
          index === 0 ? 0 : routeDetails.durationLegs[index - 1] ?? 0;
        return {
          place: { id: placeDto.id },
          excursionDuration: placeDto.excursionDuration,
          translations: excursionPlacesTranslations[index],
          distance: distance,
          duration: duration,
          position: index,
        };
      })
    );

    const titleTranslationRu =
      excursionTranslations.find((tr) => tr.language.id === LanguageIdEnum.RU)
        ?.title || dto.title;
    const parsedSlug = await this.createValidSlug(titleTranslationRu);

    const excursion = this.excursionsRepository.create({
      slug: parsedSlug,
      distance: routeDetails.totalDistance,
      translations: excursionTranslations,
      duration: routeDetails.totalDuration,
      excursionPlaces: excursionPlaces,
      author: user,
      type: dto.type,
      travelMode: dto.travelMode,
      region: { id: dto.regionId },
    });

    const { id } = await this.excursionsRepository.save(excursion);
    return { id };
  }

  private async createValidSlug(text: string, excursionId?: number) {
    let validatedSlug = this.translationsService.parseToSlug(text);
    let success = false;
    let i = 0;
    while (!success && i < 10) {
      i += 1;
      const slugExists = await this.validateSlugExists(
        validatedSlug,
        excursionId
      );
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
        message: "Invalid slug",
      });
    }
    return validatedSlug;
  }

  async validateSlugExists(slug: string, excursionId?: number) {
    return this.excursionsRepository.exists({
      where: {
        slug: Equal(slug),
        id: excursionId ? Not(excursionId) : undefined,
      },
    });
  }

  async addView(excursionId: number) {
    return this.excursionsRepository
      .createQueryBuilder()
      .update()
      .set({ viewsCount: () => "viewsCount + 1" })
      .where({ id: Equal(excursionId) })
      .execute();
  }

  async update(
    id: number,
    dto: UpdateExcursionDto,
    langId: number,
    byAdmin = false
  ) {
    const oldExcursion = await this.excursionsRepository.findOne({
      relations: {
        translations: {
          language: true,
        },
        excursionPlaces: {
          place: true,
          translations: {
            language: true,
          },
        },
      },
      where: {
        id: id,
      },
    });
    if (!oldExcursion)
      throw new BadRequestException({ message: "Excursion not exists" });

    const places = await this.getPlacesByIds(
      dto.places.map((place) => place.id)
    );
    const waypoints = places.slice(1, -1).map((place) => place.coordinates);
    const routeDetails = await this.googleMapsService.getRouteDetails(
      places[0].coordinates,
      places[places.length - 1].coordinates,
      waypoints,
      dto.travelMode
    );
    const detectedLanguageId =
      await this.translationsService.getLanguageIdOfText(dto.description);
    const excursionTranslations = await this.updateExcursionTranslations(
      detectedLanguageId || langId,
      oldExcursion,
      dto,
      dto.shouldTranslate
    );

    const excursionPlacesTranslations = await Promise.all(
      dto.places.map((placeDto) =>
        this.updateExcursionPlaceTranslations(
          detectedLanguageId || langId,
          oldExcursion,
          placeDto,
          dto.shouldTranslate
        )
      )
    );
    const excursionPlaces = await this.excursionPlacesRepository.save(
      dto.places.map((placeDto, index) => ({
        id: oldExcursion.excursionPlaces.find(
          (excPlace) => excPlace.place.id === placeDto.id
        )?.id,
        excursion: { id: oldExcursion.id },
        place: { id: placeDto.id },
        excursionDuration: placeDto.excursionDuration,
        translations: excursionPlacesTranslations[index],
        distance: routeDetails.distanceLegs[index + 1] ?? 0,
        duration: routeDetails.durationLegs[index + 1] ?? 0,
        position: index,
      }))
    );
    const excursion = this.excursionsRepository.create({
      id: id,
      distance: routeDetails.totalDistance,
      translations: excursionTranslations,
      duration: routeDetails.totalDuration,
      excursionPlaces: excursionPlaces,
      type: dto.type,
      travelMode: dto.travelMode,
      region: { id: dto.regionId },
    });
    if (!byAdmin) {
      excursion.status = ExcursionStatusesEnum.MODERATION;
      excursion.moderationMessage = null;
    }

    await this.excursionsRepository.save(excursion);
    return { id };
  }

  async findExcursions(
    dto: ExcursionsListRequestDto,
    langId: number,
    userId?: number
  ) {
    const orderDirection = dto.orderAsc ? "ASC" : "DESC";

    const getDateWhereOption = () => {
      if (!!dto.dateFrom && !!dto.dateTo)
        return Between(new Date(dto.dateFrom), new Date(dto.dateTo));
      if (!!dto.dateFrom) return MoreThanOrEqual(new Date(dto.dateFrom));
      if (!!dto.dateTo) return LessThanOrEqual(new Date(dto.dateTo));
      return undefined;
    };

    const authorWhereStatement =
      userId ?? (!!dto.userIds?.length ? In(dto.userIds) : undefined);

    const res = await this.excursionsRepository.findAndCount({
      relations: {
        translations: true,
        excursionPlaces: { place: { translations: true } },
        author: true,
      },
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      order: {
        createdAt:
          dto.orderBy === ExcursionsListOrderByEnum.CREATED_AT || !dto.orderBy
            ? orderDirection
            : undefined,
        updatedAt:
          dto.orderBy === ExcursionsListOrderByEnum.UPDATED_AT
            ? orderDirection
            : undefined,
        translations: {
          title:
            dto.orderBy === ExcursionsListOrderByEnum.TITLE
              ? orderDirection
              : undefined,
        },
        type:
          dto.orderBy === ExcursionsListOrderByEnum.TYPE
            ? orderDirection
            : undefined,
        status:
          dto.orderBy === ExcursionsListOrderByEnum.STATUS
            ? orderDirection
            : undefined,
      },
      select: {
        translations: { title: true },
        author: { firstName: true, lastName: true, email: true },
        excursionPlaces: {
          position: true,
          id: true,
          duration: true,
          distance: true,
          excursionDuration: true,
          place: {
            slug: true,
            id: true,
            coordinates: true,
            translations: {
              title: true,
            },
          },
        },
      },
      where: {
        author: {
          id: authorWhereStatement,
        },
        translations: {
          title:
            !!dto.search && dto.search.length > 0
              ? ILike(`%${dto.search}%`)
              : undefined,
          language: {
            id: langId,
          },
        },
        excursionPlaces: {
          place: {
            translations: {
              language: { id: langId },
            },
          },
        },
        status:
          !!dto.statuses && dto.statuses?.length > 0
            ? In(dto.statuses)
            : undefined,
        createdAt: getDateWhereOption(),
      },
    });

    return res;
  }

  async findOne(idOrSlug: number | string, langId: number) {
    const isSlug = typeof idOrSlug === "string";
    const res = await this.excursionsRepository.findOne({
      relations: {
        translations: true,
        region: {
          translations: true,
        },
        author: true,
        excursionPlaces: {
          translations: true,
          place: {
            translations: true,
            images: true,
            reviews: { translations: true },
          },
        },
      },
      order: {
        excursionPlaces: {
          position: "asc",
          place: {
            images: { position: "asc" },
            reviews: { createdAt: "desc" },
          },
        },
      },
      select: {
        translations: true,
        id: true,
        type: true,
        distance: true,
        slug: true,
        duration: true,
        createdAt: true,
        updatedAt: true,
        travelMode: true,
        viewsCount: true,
        author: { id: true, firstName: true, lastName: true },
        moderationMessage: true,
        status: true,
        region: {
          id: true,
          translations: { title: true },
        },
        excursionPlaces: {
          position: true,
          id: true,
          duration: true,
          distance: true,
          excursionDuration: true,
          isPrimary: true,
          translations: { description: true },
          place: {
            slug: true,
            id: true,
            coordinates: true,
            images: true,
            reviews: {
              id: true,
              createdAt: true,
              translations: {
                title: true,
              },
            },
            translations: {
              title: true,
              address: true,
            },
          },
        },
      },
      where: {
        id: isSlug ? undefined : idOrSlug,
        slug: isSlug ? Equal(idOrSlug) : undefined,
        translations: {
          language: {
            id: langId,
          },
        },
        region: [
          { id: IsNull() },
          {
            translations: { language: { id: langId } },
          },
        ],
        excursionPlaces: {
          translations: {
            language: {
              id: langId,
            },
          },
          place: {
            translations: {
              language: { id: langId },
            },
            reviews: {
              status: Equal(ReviewStatusesEnum.APPROVED),
              translations: {
                language: { id: langId },
              },
            },
          },
        },
      },
    });

    return res;
  }

  async findModerationExcursions(
    dto: ExcursionsModerationListRequestDto,
    langId: number
  ) {
    const orderDirection = dto.orderAsc ? "ASC" : "DESC";

    const getDateWhereOption = () => {
      if (!!dto.dateFrom && !!dto.dateTo)
        return Between(new Date(dto.dateFrom), new Date(dto.dateTo));
      if (!!dto.dateFrom) return MoreThanOrEqual(new Date(dto.dateFrom));
      if (!!dto.dateTo) return LessThanOrEqual(new Date(dto.dateTo));
      return undefined;
    };

    const res = await this.excursionsRepository.findAndCount({
      relations: {
        author: true,
        translations: true,
        excursionPlaces: { place: { translations: true } },
      },
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      order: {
        createdAt:
          dto.orderBy === ExcursionsModerationListOrderByEnum.CREATED_AT
            ? orderDirection
            : undefined,
        updatedAt:
          dto.orderBy === ExcursionsModerationListOrderByEnum.UPDATED_AT ||
          !dto.orderBy
            ? orderDirection
            : undefined,
        translations: {
          title:
            dto.orderBy === ExcursionsModerationListOrderByEnum.TITLE
              ? orderDirection
              : undefined,
        },
        type:
          dto.orderBy === ExcursionsModerationListOrderByEnum.TYPE
            ? orderDirection
            : undefined,
        author: {
          firstName:
            dto.orderBy === ExcursionsModerationListOrderByEnum.AUTHOR
              ? orderDirection
              : undefined,
          lastName:
            dto.orderBy === ExcursionsModerationListOrderByEnum.AUTHOR
              ? orderDirection
              : undefined,
        },
      },
      select: {
        id: true,
        slug: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        author: {
          firstName: true,
          lastName: true,
          email: true,
        },
        translations: { title: true },
        excursionPlaces: {
          position: true,
          id: true,
          place: {
            id: true,
            translations: {
              title: true,
            },
          },
        },
      },
      where: {
        status: Equal(ExcursionStatusesEnum.MODERATION),
        translations: {
          title:
            !!dto.search && dto.search.length > 0
              ? ILike(`%${dto.search}%`)
              : undefined,
          language: {
            id: langId,
          },
        },
        excursionPlaces: {
          place: {
            translations: {
              language: { id: langId },
            },
          },
        },
        createdAt: getDateWhereOption(),
      },
    });

    return res;
  }

  async searchExcursions(dto: ExcursionsSearchRequestDto, langId: number) {
    const orderDirection = dto.orderAsc ? "ASC" : "DESC";

    // Create a subquery to find excursion IDs that match the search criteria
    const subQuery = this.excursionsRepository
      .createQueryBuilder("excursion")
      .innerJoin(
        "excursion.translations",
        "translations",
        "translations.languageId = :langId",
        { langId }
      )
      .innerJoin("excursion.excursionPlaces", "excursionPlaces")
      .innerJoin(
        "excursionPlaces.translations",
        "excursionPlaceTranslations",
        "excursionPlaceTranslations.languageId = :langId",
        { langId }
      )
      .innerJoin("excursionPlaces.place", "place")
      .innerJoin(
        "place.translations",
        "placeTranslations",
        "placeTranslations.languageId = :langId",
        { langId }
      )
      .select("excursion.id") // Only select the ID for the IN clause
      .where("excursion.status = :status", {
        status: ExcursionStatusesEnum.APPROVED,
      });

    if (dto.types?.length) {
      subQuery.andWhere("excursion.type IN (:...types)", {
        types: dto.types,
      });
    }

    if (dto.travelModes?.length) {
      subQuery.andWhere("excursion.travelMode IN (:...travelModes)", {
        travelModes: dto.travelModes,
      });
    }

    if (dto.regionIds?.length) {
      subQuery.andWhere("excursion.regionId IN (:...regionIds)", {
        regionIds: dto.regionIds,
      });
    }

    // Add search conditions to the subquery only
    if (dto.search?.length) {
      const searchTerm = `%${dto.search}%`;
      subQuery.andWhere(
        new Brackets((qb) => {
          qb.where("translations.title LIKE :search", { search: searchTerm })
            .orWhere("translations.description LIKE :search", {
              search: searchTerm,
            })
            .orWhere("excursionPlaceTranslations.description LIKE :search", {
              search: searchTerm,
            })
            .orWhere("placeTranslations.title LIKE :search", {
              search: searchTerm,
            })
            .orWhere("placeTranslations.description LIKE :search", {
              search: searchTerm,
            });
        })
      );
    }

    // Create the base query builder
    const queryBuilder = this.excursionsRepository
      .createQueryBuilder("excursion")
      .innerJoinAndSelect(
        "excursion.translations",
        "translations",
        "translations.languageId = :langId",
        { langId }
      )
      .innerJoin("excursion.excursionPlaces", "excursionPlaces")
      .innerJoin("excursionPlaces.place", "place")
      .innerJoinAndSelect("place.images", "placeImages")
      .where("excursion.id IN (" + subQuery.getQuery() + ")") // Filter excursions using the subquery
      .setParameters(subQuery.getParameters());

    // Add count of excursionPlaces
    queryBuilder.loadRelationCountAndMap(
      "excursion.placesCount",
      "excursion.excursionPlaces"
    );

    // Apply ordering
    switch (dto.orderBy) {
      case ExcursionsSearchOrderByEnum.TITLE:
        queryBuilder.orderBy("translations.title", orderDirection);
        break;
      case ExcursionsSearchOrderByEnum.RATING:
        queryBuilder.orderBy("excursion.viewsCount", orderDirection);
        break;
      case ExcursionsSearchOrderByEnum.CREATED_AT:
      default:
        queryBuilder.orderBy("excursion.createdAt", orderDirection);
    }

    // Apply pagination
    queryBuilder.skip(dto.page * dto.pageSize);
    queryBuilder.take(dto.pageSize);

    // Select specific fields to match your original query
    queryBuilder.select([
      "excursion.id",
      "excursion.slug",
      "excursion.duration",
      "excursion.distance",
      "excursion.createdAt",
      "excursion.type",
      "excursion.travelMode",
      "excursion.viewsCount",
      "translations.title",
      "translations.description",
      "excursionPlaces.position",
      "excursionPlaces.isPrimary",
      "excursionPlaces.id",
      "place.id",
      "placeImages.id",
      "placeImages.url",
      "placeImages.position",
    ]);

    // Execute the query
    const result = await queryBuilder.getManyAndCount();

    return result;
  }

  async checkUserRelation(userId: number, excursionId: number) {
    return await this.excursionsRepository.exists({
      where: {
        author: {
          id: Equal(userId),
        },
        id: Equal(excursionId),
      },
    });
  }

  async remove(id: number) {
    const deleted = await this.excursionsRepository.remove(
      this.excursionsRepository.create({ id })
    );
    return { id };
  }

  async getSlugs() {
    return this.excursionsRepository
      .createQueryBuilder("excursion")
      .where("excursion.status = :approvedStatus", {
        approvedStatus: ExcursionStatusesEnum.APPROVED,
      })
      .select(["excursion.id", "excursion.slug"])
      .getMany();
  }

  async updateSlug(id: number, slug: string) {
    const excursionExists = await this.checkExist(id);
    if (!excursionExists) {
      throw new NotFoundException({ message: "Excursion not exists" });
    }
    await this.excursionsRepository.save({
      id,
      slug,
    });
  }

  async setExcursionPrimaryPlace(
    excursionId: number,
    excursionPlaceId: number
  ) {
    await this.excursionPlacesRepository.update(
      {
        excursion: { id: Equal(excursionId) },
      },
      this.excursionPlacesRepository.create({
        isPrimary: false,
      })
    );

    await this.excursionPlacesRepository.update(
      {
        id: Equal(excursionPlaceId),
      },
      this.excursionPlacesRepository.create({
        isPrimary: true,
      })
    );
  }

  private async checkExist(excursionId: number): Promise<boolean> {
    return this.excursionsRepository.exists({
      where: {
        id: Equal(excursionId),
      },
    });
  }

  async moderateExcursion(id: number, dto: ModerationDto, moderator: User) {
    const excursion = await this.excursionsRepository.findOne({
      where: {
        id: id,
      },
      select: {
        id: true,
      },
    });
    if (!excursion)
      throw new NotFoundException({
        message: "Excursion not found",
      });

    const updatedStatus = dto.accept
      ? ExcursionStatusesEnum.APPROVED
      : ExcursionStatusesEnum.REJECTED;

    await this.excursionsRepository.save({
      id: id,
      moderator: moderator,
      status: updatedStatus,
      moderationMessage: dto.feedback || null,
    });

    // send email
    const excursionForEmail = await this.getExcursionForEmail(id);
    if (!excursionForEmail || !excursionForEmail.author.receiveEmails) return;
    const email = new ExcursionEmail(
      new ExcursionForEmailDto(excursionForEmail)
    );
    this.mailingService.sendEmail(email);
  }

  async changeStatus(id: number, dto: ChangeExcursionStatusDto) {
    const excursion = await this.excursionsRepository.findOne({
      where: { id: Equal(id) },
      select: { id: true, status: true },
    });
    if (!excursion)
      throw new NotFoundException({ message: "Excursion not found" });

    // update status
    excursion.status = dto.status;
    if (dto.status === ExcursionStatusesEnum.REJECTED)
      excursion.moderationMessage = dto.message || "";
    if (dto.status === ExcursionStatusesEnum.APPROVED)
      excursion.moderationMessage = null;
    await this.excursionsRepository.save(excursion);

    // send email
    const excursionForEmail = await this.getExcursionForEmail(id);
    if (!excursionForEmail || !excursionForEmail.author.receiveEmails) return;

    const email = new ExcursionEmail(
      new ExcursionForEmailDto({
        ...excursionForEmail,
        moderationMessage: dto.message,
      })
    );
    await this.mailingService.sendEmail(email);
  }

  private async getExcursionForEmail(id: number) {
    const excursion = await this.excursionsRepository.findOne({
      relations: {
        translations: true,
        author: true,
      },
      select: {
        id: true,
        createdAt: true,
        moderationMessage: true,
        status: true,
        author: {
          email: true,
          firstName: true,
          lastName: true,
          receiveEmails: true,
        },
        translations: { title: true },
      },
      where: {
        id: Equal(id),
        translations: {
          language: {
            id: LanguageIdEnum.RU,
          },
        },
      },
    });
    return excursion;
  }

  // create excursion translations
  private async createExcursionTranslations(
    sourceLangId: number,
    dto: CreateExcursionDto
  ) {
    const allLanguages = await this.translationsService.getAllLanguages();

    const translations: ExcursionTranslation[] = [];

    await Promise.all(
      allLanguages.map(async (lang) => {
        // translate titles
        const newTranslation = this.excursionTranslationsRepository.create({
          language: {
            id: lang.id,
          },
          title:
            lang.id === sourceLangId
              ? dto.title
              : await this.translationsService.createTranslation(
                  dto.title,
                  lang.code,
                  sourceLangId
                ),
          description:
            lang.id === sourceLangId
              ? dto.description
              : await this.translationsService.createTranslation(
                  dto.description,
                  lang.code,
                  sourceLangId
                ),
          original: lang.id === sourceLangId,
        });
        translations.push(newTranslation);
        return;
      })
    );

    return translations;
  }

  // update excursion translations
  private async updateExcursionTranslations(
    sourceLangId: number,
    excursion: Excursion,
    dto: UpdateExcursionDto,
    translateAll: boolean
  ) {
    const translations: ExcursionTranslation[] = [];

    // helper function to merge update translations
    const mergeUpdateTranslations = async (
      arrayToSave: ExcursionTranslation[],
      translation: ExcursionTranslation
    ) => {
      const newTranslation = this.excursionTranslationsRepository.create({
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
            ? await this.translationsService.createTranslation(
                dto.title,
                translation.language.code,
                sourceLangId
              )
            : translation.title,
        description:
          translation.language.id === sourceLangId
            ? dto.description
            : translateAll
            ? await this.translationsService.createTranslation(
                dto.description,
                translation.language.code,
                sourceLangId
              )
            : translation.description,
        original: translation.language.id === sourceLangId,
      });
      arrayToSave.push(newTranslation);
      return;
    };

    const updatedTranslations = excursion.translations.map(
      async (translation) => {
        // translate excursion
        await mergeUpdateTranslations(translations, translation);
        return;
      }
    );

    await Promise.all(updatedTranslations);

    return translations;
  }

  // create excursion place translations
  private async createExcursionPlaceTranslations(
    sourceLangId: number,
    dto: CreateExcursionPlaceDto
  ) {
    this.logger.log("CREATE: Excursion places translations started");
    const allLanguages = await this.translationsService.getAllLanguages();
    const shouldTranslate = dto.description?.length > 2;

    const translations: ExcursionPlaceTranslation[] = [];

    await Promise.all(
      allLanguages.map(async (lang) => {
        // translate titles
        const newTranslation = this.excursionPlaceTranslationsRepository.create(
          {
            language: {
              id: lang.id,
            },
            description:
              lang.id === sourceLangId || !shouldTranslate
                ? dto.description || ""
                : await this.translationsService.createTranslation(
                    dto.description,
                    lang.code,
                    sourceLangId
                  ),
            original: lang.id === sourceLangId,
          }
        );
        translations.push(newTranslation);
        return;
      })
    );

    return translations;
  }

  // update excursion place translations
  private async updateExcursionPlaceTranslations(
    sourceLangId: number,
    excursion: Excursion,
    dto: CreateExcursionPlaceDto,
    translateAll: boolean
  ) {
    this.logger.log("UPDATE: Excursion places translations started");
    const translations: ExcursionPlaceTranslation[] = [];

    // helper function to merge update translations
    const mergeUpdateTranslations = async (
      arrayToSave: ExcursionPlaceTranslation[],
      translation: ExcursionPlaceTranslation
    ) => {
      const { id, language } = translation;
      const { description: newDescription } = dto;

      // Determine if translation is needed
      const shouldTranslate = newDescription?.length > 2;
      const isSourceLanguage = language.id === sourceLangId;

      let description = translation.description;

      if (isSourceLanguage) {
        // Update description for the source language
        description = newDescription;
      } else if (translateAll) {
        if (shouldTranslate) {
          // Translate description if translateAll is enabled and description is valid
          description = await this.translationsService.createTranslation(
            newDescription,
            language.code,
            sourceLangId
          );
        } else {
          description = dto.description || "";
        }
      } else if (!translateAll) {
        // Keep the existing description if translateAll is not enabled
        description = translation.description;
      }

      // Create the new translation object
      const newTranslation = this.excursionPlaceTranslationsRepository.create({
        id,
        language: { id: language.id },
        description,
        original: isSourceLanguage,
      });

      // Add the new translation to the array
      arrayToSave.push(newTranslation);
    };

    const oldExcursionPlace = excursion.excursionPlaces.find(
      (excursionPlace) => excursionPlace.place.id === dto.id
    );

    // If place translations exist - update conditionally
    if (oldExcursionPlace) {
      const updatedTranslations = oldExcursionPlace.translations.map(
        async (translation) => {
          // translate excursion
          await mergeUpdateTranslations(translations, translation);
          return;
        }
      );

      await Promise.all(updatedTranslations);

      return translations;
    } else {
      // If place is new - create new translations
      const newTranslations = await this.createExcursionPlaceTranslations(
        sourceLangId,
        dto
      );
      return newTranslations;
    }
  }

  private async getPlacesByIds(placeIds: number[]): Promise<Place[]> {
    const places = await this.placesRepository.find({
      where: {
        id: In(placeIds),
        status: Equal(PlaceStatusesEnum.APPROVED),
      },
      select: { id: true, coordinates: true },
    });

    const placesMap = new Map(places.map((place) => [place.id, place]));

    return placeIds
      .map((id) => placesMap.get(id) || (null as any))
      .filter(Boolean);
  }
}
