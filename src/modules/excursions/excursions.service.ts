import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  Equal,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { Place } from '../places/entities/place.entity';
import { User } from '../users/entities/user.entity';
import { Excursion } from './entities/excursion.entity';
import { ExcursionPlace } from './entities/excursion-place.entity';
import { ExcursionTranslation } from './entities/excursion-translation.entity';
import { ExcursionPlaceTranslation } from './entities/excursion-place-translation.entity';
import { PlaceStatusesEnum } from '../places/enums/place-statuses.enum';
import { GoogleMapsService } from '../google-maps/google-maps.service';
import { TranslationsService } from '../translations/translations.service';
import { MailingService } from '../mailing/mailing.service';
import { CreateExcursionPlaceDto } from './dto/create-excursion-place.dto';
import { ExcursionStatusesEnum } from './enums/excursion-statuses.enum';
import { LanguageIdEnum } from '../languages/enums/language-id.enum';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { ExcursionsListOrderByEnum } from './enums/excursions-list-order-by.enum';
import { ExcursionsListRequestDto } from './dto/excursions-list-request.dto';

@Injectable()
export class ExcursionsService {
  private readonly logger = new Logger('Search service');
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
    private mailingService: MailingService,
  ) {}

  async create(dto: CreateExcursionDto, langId: number, user: User) {
    const places = await this.getPlacesByIds(
      dto.places.map((place) => place.id),
    );
    const waypoints = places.slice(1, -1).map((place) => place.coordinates);
    const routeDetails = await this.googleMapsService.getRouteDetails(
      places[0].coordinates,
      places[places.length - 1].coordinates,
      waypoints,
      dto.travelMode,
    );
    const detectedLanguageId =
      await this.translationsService.getLanguageIdOfText(dto.description);
    const excursionTranslations = await this.createExcursionTranslations(
      detectedLanguageId || langId,
      dto,
    );

    const excursionPlacesTranslations = await Promise.all(
      dto.places.map((placeDto) =>
        this.createExcursionPlaceTranslations(
          detectedLanguageId || langId,
          placeDto,
        ),
      ),
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
      }),
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
        excursionId,
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
        message: 'Invalid slug',
      });
    }
    return validatedSlug;
  }

  private async validateSlugExists(slug: string, excursionId?: number) {
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
      .set({ viewsCount: () => 'viewsCount + 1' })
      .where({ id: Equal(excursionId) })
      .execute();
  }

  async update(
    id: number,
    dto: UpdateExcursionDto,
    langId: number,
    byAdmin = false,
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
      throw new BadRequestException({ message: 'Excursion not exists' });

    const places = await this.getPlacesByIds(
      dto.places.map((place) => place.id),
    );
    const waypoints = places.slice(1, -1).map((place) => place.coordinates);
    const routeDetails = await this.googleMapsService.getRouteDetails(
      places[0].coordinates,
      places[places.length - 1].coordinates,
      waypoints,
      dto.travelMode,
    );
    const detectedLanguageId =
      await this.translationsService.getLanguageIdOfText(dto.description);
    const excursionTranslations = await this.updateExcursionTranslations(
      detectedLanguageId || langId,
      oldExcursion,
      dto,
      dto.shouldTranslate,
    );

    const excursionPlacesTranslations = await Promise.all(
      dto.places.map((placeDto) =>
        this.updateExcursionPlaceTranslations(
          detectedLanguageId || langId,
          oldExcursion,
          placeDto,
          dto.shouldTranslate,
        ),
      ),
    );
    const excursionPlaces = await this.excursionPlacesRepository.save(
      dto.places.map((placeDto, index) => ({
        place: { id: placeDto.id },
        excursionDuration: placeDto.excursionDuration,
        translations: excursionPlacesTranslations[index],
        distance: routeDetails.distanceLegs[index + 1] ?? 0,
        duration: routeDetails.durationLegs[index + 1] ?? 0,
        position: index,
      })),
    );
    const excursion = this.excursionsRepository.create({
      id: id,
      distance: routeDetails.totalDistance,
      translations: excursionTranslations,
      duration: routeDetails.totalDuration,
      excursionPlaces: excursionPlaces,
      type: dto.type,
      travelMode: dto.travelMode,
    });
    if (!byAdmin) {
      excursion.status = ExcursionStatusesEnum.MODERATION;
      excursion.moderationMessage = null;
    }

    await this.excursionsRepository.save(excursion);
    return { id };
  }

  async findMyExcursions(
    dto: ExcursionsListRequestDto,
    langId: number,
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

    const res = await this.excursionsRepository.findAndCount({
      relations: {
        translations: true,
        excursionPlaces: { place: { translations: true } },
      },
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      order: {
        createdAt:
          dto.orderBy === ExcursionsListOrderByEnum.CREATED_AT || !dto.orderBy
            ? orderDirection
            : undefined,
        translations: {
          title:
            dto.orderBy === ExcursionsListOrderByEnum.TITLE
              ? orderDirection
              : undefined,
        },
        distance:
          dto.orderBy === ExcursionsListOrderByEnum.DISTANCE
            ? orderDirection
            : undefined,
        duration:
          dto.orderBy === ExcursionsListOrderByEnum.DURATION
            ? orderDirection
            : undefined,
        excursionPlaces: { position: 'asc' },
      },
      select: {
        translations: { title: true },
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
          id: tokenPayload.id,
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
        createdAt: getDateWhereOption(),
      },
    });

    return res;
  }

  async findOne(idOrSlug: number | string, langId: number) {
    const isSlug = typeof idOrSlug === 'string';
    const res = await this.excursionsRepository.findOne({
      relations: {
        translations: true,
        excursionPlaces: { translations: true, place: { translations: true } },
      },
      order: {
        excursionPlaces: { position: 'asc' },
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
        excursionPlaces: {
          position: true,
          id: true,
          duration: true,
          distance: true,
          excursionDuration: true,
          translations: { description: true },
          place: {
            slug: true,
            id: true,
            coordinates: true,
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
          },
        },
      },
    });

    return res;
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
      this.excursionsRepository.create({ id }),
    );
    return { id };
  }

  // create excursion translations
  private async createExcursionTranslations(
    sourceLangId: number,
    dto: CreateExcursionDto,
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
                  sourceLangId,
                ),
          description:
            lang.id === sourceLangId
              ? dto.description
              : await this.translationsService.createTranslation(
                  dto.description,
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

  // update excursion translations
  private async updateExcursionTranslations(
    sourceLangId: number,
    excursion: Excursion,
    dto: UpdateExcursionDto,
    translateAll: boolean,
  ) {
    const translations: ExcursionTranslation[] = [];

    // helper function to merge update translations
    const mergeUpdateTranslations = async (
      arrayToSave: ExcursionTranslation[],
      translation: ExcursionTranslation,
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
                sourceLangId,
              )
            : translation.title,
        description:
          translation.language.id === sourceLangId
            ? dto.description
            : translateAll
            ? await this.translationsService.createTranslation(
                dto.description,
                translation.language.code,
                sourceLangId,
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
      },
    );

    await Promise.all(updatedTranslations);

    return translations;
  }

  // create excursion place translations
  private async createExcursionPlaceTranslations(
    sourceLangId: number,
    dto: CreateExcursionPlaceDto,
  ) {
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
                ? dto.description || ''
                : await this.translationsService.createTranslation(
                    dto.description,
                    lang.code,
                    sourceLangId,
                  ),
            original: lang.id === sourceLangId,
          },
        );
        translations.push(newTranslation);
        return;
      }),
    );

    return translations;
  }

  // update excursion place translations
  private async updateExcursionPlaceTranslations(
    sourceLangId: number,
    excursion: Excursion,
    dto: CreateExcursionPlaceDto,
    translateAll: boolean,
  ) {
    const translations: ExcursionPlaceTranslation[] = [];

    // helper function to merge update translations
    const mergeUpdateTranslations = async (
      arrayToSave: ExcursionPlaceTranslation[],
      translation: ExcursionPlaceTranslation,
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
            sourceLangId,
          );
        } else {
          description = dto.description || '';
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
      (excursionPlace) => excursionPlace.place.id === dto.id,
    );

    // If place translations exist - update conditionally
    if (oldExcursionPlace) {
      const updatedTranslations = oldExcursionPlace.translations.map(
        async (translation) => {
          // translate excursion
          await mergeUpdateTranslations(translations, translation);
          return;
        },
      );

      await Promise.all(updatedTranslations);

      return translations;
    } else {
      // If place is new - create new translations
      const newTranslations = await this.createExcursionPlaceTranslations(
        sourceLangId,
        dto,
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
