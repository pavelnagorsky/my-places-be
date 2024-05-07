import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SearchRequestDto } from '../places/dto/search-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from '../places/entities/place.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PlaceTranslation } from '../places/entities/place-translation.entity';
import { PlaceStatusesEnum } from '../places/enums/place-statuses.enum';

@Injectable()
export class SearchService {
  private readonly logger = new Logger('Search service');
  constructor(
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(PlaceTranslation)
    private placeTranslationsRepository: Repository<PlaceTranslation>,
  ) {}

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

  private readonly geolocationSQLQuery = `
    ST_Distance_Sphere(
      Point(
        SUBSTRING_INDEX(place.coordinates, ';', 1),
        SUBSTRING_INDEX(place.coordinates, ';', -1)
      ),
      Point(
        SUBSTRING_INDEX(:searchCoordinates, ';', 1),
        SUBSTRING_INDEX(:searchCoordinates, ';', -1)
      ), 
      4326
    ) <= :radius
  `;

  private selectPlacesForSearchQuery(
    qb: SelectQueryBuilder<Place>,
  ): SelectQueryBuilder<Place> {
    return qb
      .where('place.status = :approvedStatus', {
        approvedStatus: PlaceStatusesEnum.APPROVED,
      })
      .leftJoinAndSelect('place.categories', 'categories')
      .leftJoinAndSelect('categories.titles', 'categoriesTitles')
      .leftJoinAndSelect('place.type', 'type')
      .leftJoinAndSelect('type.titles', 'typeTitles')
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
      .orderBy({
        'place.createdAt': 'DESC',
        'place.likesCount': 'DESC',
        'place.viewsCount': 'DESC',
      });
  }

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
      const qb = this.selectPlacesForSearchQuery(initialQb);
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
          radius: searchDto.radius,
        });
      }
      const result = await resultQuery.getManyAndCount();
      return result;
    } catch (e) {
      this.logger.error('Error occured while search request', e);
      throw new BadRequestException({ message: 'Error occured' });
    }
  }
}
