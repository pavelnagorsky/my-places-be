import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from '../places/entities/place.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PlaceStatusesEnum } from '../places/enums/place-statuses.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SearchRequestDto } from './dto/search-request.dto';
import { Interval } from '@nestjs/schedule';
import { SearchPlacesOrderByEnum } from './enums/search-places-order-by.enum';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger('Search service');
  private readonly placesSearchCacheKey = 'placesSearch';
  // 12 hours TTL
  private readonly placesCacheTTL = 12 * 60 * 60 * 1000;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
  ) {}

  onModuleInit(): any {
    // fulfill search cache after the app start
    this.handleCreateCacheCron();
  }

  private getLatLng(coordinates: string) {
    const latLng = coordinates.split(';');
    const lat = latLng[0] ? +latLng[0] : 1;
    const lng = latLng[1] ? +latLng[1] : 1;
    return {
      lat,
      lng,
    };
  }

  private filterByCoordinates(
    placeCoordinates: string,
    searchCoordinates: string,
    // radius of search in KM
    radius: number,
  ): boolean {
    const origin = this.getLatLng(placeCoordinates);
    const search = this.getLatLng(searchCoordinates);

    const EarthRadius = 6371; // km
    const originLatRadian = (origin.lat * Math.PI) / 180; // origin latitude in radians
    const searchLatRadian = (search.lat * Math.PI) / 180; // search latitude in radians
    const deltaLatRadian = ((search.lat - origin.lat) * Math.PI) / 180; // delta between latitudes radians
    const deltaLngRadian = ((search.lng - origin.lng) * Math.PI) / 180; // delta between longitude radians

    const a =
      Math.sin(deltaLatRadian / 2) * Math.sin(deltaLatRadian / 2) +
      Math.cos(originLatRadian) *
        Math.cos(searchLatRadian) *
        Math.sin(deltaLngRadian / 2) *
        Math.sin(deltaLngRadian / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = EarthRadius * c; // in metres
    // this.logger.debug(
    //   `distance and radius in km : ${distance}, ${radius}. Accept: ${
    //     distance <= radius
    //   }`,
    // );

    return distance <= radius;
  }

  private getRouteBounds(
    startCoordinates: string,
    endCoordinates: string,
    // radius of search in KM
    radius: number,
  ) {
    const startLatLng = this.getLatLng(startCoordinates);
    const endLatLng = this.getLatLng(endCoordinates);

    const dX = endLatLng.lat - startLatLng.lat;
    const dY = endLatLng.lng - startLatLng.lng;

    const Lx = dY / Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
    const Ly = -dX / Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
    const R = radius / 111.32;
    const bound1 = {
      lat: startLatLng.lat + R * Lx,
      lng: startLatLng.lng + R * Ly,
    };
    const bound2 = {
      lat: startLatLng.lat - R * Lx,
      lng: startLatLng.lng - R * Ly,
    };
    const bound3 = { lat: bound1.lat + dX, lng: bound1.lng + dY };
    const bound4 = { lat: bound2.lat + dX, lng: bound2.lng + dY };

    const bounds = [bound1, bound2, bound3, bound4];

    return bounds;
  }

  isPointInPolygon(point: number[], polygon: number[][]): boolean {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  private selectPlacesForSearchQuery(
    qb: SelectQueryBuilder<Place>,
  ): SelectQueryBuilder<Place> {
    return qb
      .where('place.status = :approvedStatus', {
        approvedStatus: PlaceStatusesEnum.APPROVED,
      })
      .leftJoinAndSelect('place.categories', 'categories')
      .leftJoinAndSelect('categories.titles', 'categoriesTitles')
      .leftJoinAndMapOne(
        'categoriesTitles.language',
        'categoriesTitles.language',
        'categories_titles_language',
        'categoriesTitles.language = categories_titles_language.id',
      )
      .leftJoinAndSelect('place.type', 'type')
      .leftJoinAndSelect('type.titles', 'typeTitles')
      .leftJoinAndMapOne(
        'typeTitles.language',
        'typeTitles.language',
        'type_titles_language',
        'typeTitles.language = type_titles_language.id',
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
      .leftJoinAndSelect('place.translations', 'placeTranslations')
      .leftJoinAndMapOne(
        'placeTranslations.language',
        'placeTranslations.language',
        'place_translations_language',
        'placeTranslations.language = place_translations_language.id',
      )
      .orderBy({
        'place.createdAt': 'DESC',
        'place.likesCount': 'DESC',
        'place.viewsCount': 'DESC',
      });
  }

  // filters & helpers

  private applyOrderBy(
    places: Place[],
    orderBy: SearchPlacesOrderByEnum,
    langId: number,
  ) {
    let sortedPlaces = places;
    if (orderBy === SearchPlacesOrderByEnum.CreatedAt) {
      sortedPlaces = places
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
    if (orderBy === SearchPlacesOrderByEnum.Rating) {
      sortedPlaces = places.slice().sort((a, b) => {
        if (a.likesCount === b.likesCount) {
          return b.viewsCount - a.viewsCount; // If likes are equal, sort vy views
        }
        return b.likesCount - a.likesCount; // Else sort by likes
      });
    }
    if (orderBy === SearchPlacesOrderByEnum.Title) {
      sortedPlaces = places.slice().sort((a, b) => {
        const aTranslations = a.translations.find(
          (tr) => tr.language.id === langId,
        );
        const bTranslations = b.translations.find(
          (tr) => tr.language.id === langId,
        );

        if (!aTranslations || !bTranslations) {
          console.error('Translation not found for one of the items:', a, b);
          return 0; // Keep original order if translation is missing
        }

        const aTitle = aTranslations.title;
        const bTitle = bTranslations.title;

        // Check if titles contain the character «
        const aContainsSpecialChar = aTitle.startsWith('«');
        const bContainsSpecialChar = bTitle.startsWith('«');

        if (aContainsSpecialChar && !bContainsSpecialChar) {
          return 1; // Place a after b
        }
        if (!aContainsSpecialChar && bContainsSpecialChar) {
          return -1; // Place a before b
        }

        return aTitle.localeCompare(bTitle, undefined, {
          sensitivity: 'base',
        });
      });
    }
    return sortedPlaces;
  }

  private applyPagination(places: Place[], dto: SearchRequestDto) {
    // Calculate the start index
    const startIndex = dto.pageSize * dto.page;

    // Calculate the end index
    const endIndex = startIndex + dto.pageSize;

    // Return the slice of data
    return places.slice(startIndex, endIndex);
  }

  private filterPlacesByTitle(
    places: Place[],
    searchText: string,
    langId: number,
  ): Place[] {
    const lowerSearchText = searchText.toLowerCase();
    return places.filter((place) => {
      const placeTranslation = place.translations.find(
        (tr) => tr.language.id === langId,
      );
      if (!placeTranslation) return false;
      return placeTranslation.title.toLowerCase().includes(lowerSearchText);
    });
  }

  private searchFromCache(
    dto: SearchRequestDto,
    langId: number,
    places: Place[],
  ): [Place[], number] {
    let resultPlaces = places;
    const isSearchByTitle = dto.title?.length > 0;

    // if search is by place titles
    if (isSearchByTitle) {
      resultPlaces = this.filterPlacesByTitle(resultPlaces, dto.title, langId);
    }

    // if there is place type filter with > 0 items
    if (dto.typesIds && dto.typesIds.length > 0) {
      resultPlaces = resultPlaces.filter((place) =>
        dto.typesIds.includes(place.type.id),
      );
    }
    // if there is place categories filter - check if at least one of them matches filter
    if (dto.categoriesIds && dto.categoriesIds.length > 0) {
      resultPlaces = resultPlaces.filter((place) => {
        return place.categories.some((category) =>
          dto.categoriesIds.includes(category.id),
        );
      });
    }
    // if there is search circle
    if (!!dto.searchStartCoordinates && !dto.searchEndCoordinates) {
      resultPlaces = resultPlaces.filter((place) =>
        this.filterByCoordinates(
          place.coordinates,
          dto.searchStartCoordinates as string,
          dto.radius,
        ),
      );
    }
    // if there is search route
    if (!!dto.searchStartCoordinates && !!dto.searchEndCoordinates) {
      const searchBounds = this.getRouteBounds(
        dto.searchStartCoordinates,
        dto.searchEndCoordinates,
        dto.radius,
      );
      resultPlaces = resultPlaces.filter((place) => {
        const placeLatLng = this.getLatLng(place.coordinates);
        const point = [placeLatLng.lng, placeLatLng.lat];
        return this.isPointInPolygon(
          point,
          searchBounds.map((latLng) => [latLng.lng, latLng.lat]),
        );
      });
    }
    const orderedResult = this.applyOrderBy(
      resultPlaces,
      dto.orderBy ?? SearchPlacesOrderByEnum.CreatedAt,
      langId,
    );
    const paginationResult = this.applyPagination(orderedResult, dto);
    return [paginationResult, resultPlaces.length];
  }

  public async search(
    dto: SearchRequestDto,
    langId: number,
  ): Promise<[Place[], number]> {
    const cachedPlaces = await this.cacheManager.get<Place[]>(
      this.placesSearchCacheKey,
    );
    if (!cachedPlaces) {
      this.handleCreateCacheCron();
      throw new NotFoundException();
    }
    return this.searchFromCache(dto, langId, cachedPlaces);
  }

  private async createSearchCache() {
    const initialQb = this.placesRepository.createQueryBuilder('place');
    const places = await this.selectPlacesForSearchQuery(initialQb).getMany();
    // Cache TTL 12 hours
    await this.cacheManager.set(
      this.placesSearchCacheKey,
      places,
      this.placesCacheTTL,
    );
  }

  private async selectPlaceSearchItem(placeId: number) {
    const initialQb = this.placesRepository.createQueryBuilder('place');
    const place = await this.selectPlacesForSearchQuery(initialQb)
      .andWhere('place.id = :id', { id: placeId })
      .getOne();
    return place;
  }

  public async updatePlaceInCache(placeId: number) {
    this.logger.log(`Modify search cache by place id: ${placeId}`);
    try {
      // select cached places
      const cachedPlaces = await this.cacheManager.get<Place[]>(
        this.placesSearchCacheKey,
      );
      // if no cache -> create cache
      if (!cachedPlaces) return this.createSearchCache();
      // select place data
      const place = await this.selectPlaceSearchItem(placeId);
      // if no place -> filter it from cached places
      if (!place) {
        await this.cacheManager.set(
          this.placesSearchCacheKey,
          cachedPlaces.filter((p) => p.id !== placeId),
          this.placesCacheTTL,
        );
        return;
      }
      // check if place exists in cache
      const placeExists = cachedPlaces.findIndex((p) => p.id === placeId) > -1;
      if (placeExists) {
        // update cached place
        await this.cacheManager.set(
          this.placesSearchCacheKey,
          cachedPlaces.map((p) => {
            if (p.id === placeId) {
              return place;
            }
            return p;
          }),
          this.placesCacheTTL,
        );
        return;
      } else {
        // add place to cache
        cachedPlaces.push(place);
        // apply order by createdAt date
        const orderedCache = cachedPlaces.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        await this.cacheManager.set(
          this.placesSearchCacheKey,
          orderedCache,
          this.placesCacheTTL,
        );
        return;
      }
    } catch (e) {
      this.logger.error('Failed to modify search cache:', e?.message);
    }
  }

  // Cron job to recreate search cache every 4 hours
  @Interval(4 * 60 * 60 * 10000)
  private async handleCreateCacheCron() {
    try {
      this.logger.log('Search cache creation CRON JOB runs');
      await this.createSearchCache();
    } catch (e) {
      this.logger.error('Cache creation CRON JOB failed:', e?.message);
    }
  }
}
