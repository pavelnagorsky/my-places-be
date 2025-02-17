import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, In, Not, Repository } from 'typeorm';
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
      dto.places.map((placeDto, index) => ({
        place: { id: placeDto.id },
        excursionDuration: placeDto.excursionDuration,
        translations: excursionPlacesTranslations[index],
        distance: routeDetails.distanceLegs[index] ?? 0,
        duration: routeDetails.durationLegs[index],
        position: index,
      })),
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
      travelMode: dto.travelMode,
      lastRouteLegDistance: routeDetails.lastRouteLegDistance,
      lastRouteLegDuration: routeDetails.lastRouteLegDuration,
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

  findAll() {
    return `This action returns all excursions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} excursion`;
  }

  private async addView(excursionId: number) {
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
          translations: {
            language: true,
          },
        },
      },
      where: {
        id: id,
      },
    });
    // TODO: expect excursionPlaces - place - id to be presented
    console.log('Old excursion', oldExcursion);
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
        distance: routeDetails.distanceLegs[index] ?? 0,
        duration: routeDetails.durationLegs[index],
        position: index,
      })),
    );
    const excursion = this.excursionsRepository.create({
      id: id,
      distance: routeDetails.totalDistance,
      translations: excursionTranslations,
      duration: routeDetails.totalDuration,
      excursionPlaces: excursionPlaces,
      travelMode: dto.travelMode,
      lastRouteLegDistance: routeDetails.lastRouteLegDistance,
      lastRouteLegDuration: routeDetails.lastRouteLegDuration,
    });
    if (!byAdmin) {
      excursion.status = ExcursionStatusesEnum.MODERATION;
      excursion.moderationMessage = null;
    }

    await this.excursionsRepository.save(excursion);
    return { id };
  }

  remove(id: number) {
    return `This action removes a #${id} excursion`;
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
              lang.id === sourceLangId
                ? dto.description
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
      const newTranslation = this.excursionPlaceTranslationsRepository.create({
        id: translation.id,
        language: {
          id: translation.language.id,
        },
        // update if this language was selected in request
        // translate if translateAll option was selected
        // else do not change
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
