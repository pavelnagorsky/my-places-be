import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  Equal,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Route } from './entities/route.entity';
import { User } from '../users/entities/user.entity';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { RoutesListRequestDto } from './dto/routes-list-request.dto';
import { RoutesListOrderByEnum } from './enums/routes-list-order-by.enum';
import { RoutePlace } from './entities/route-place.entity';
import { IGoogleCloudConfig } from '../../config/configuration';
import { firstValueFrom } from 'rxjs';
import { IGoogleDirectionsApiResponse } from '../search/interfaces/interfaces';
import { HttpService } from '@nestjs/axios';

import { Place } from '../places/entities/place.entity';
import { PlaceStatusesEnum } from '../places/enums/place-statuses.enum';
import { GoogleMapsService } from '../google-maps/google-maps.service';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger('Search service');
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(RoutePlace)
    private routesPlacesRepository: Repository<RoutePlace>,
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  async create(dto: CreateRouteDto, user: User) {
    const places = await this.getPlacesByIds(dto.placeIds);
    const routeDetails = await this.googleMapsService.getRouteDetails(
      dto.coordinatesStart,
      dto.coordinatesEnd,
      places.map((p) => p.coordinates),
      dto.travelMode,
    );
    const routePlaces = await this.routesPlacesRepository.save(
      dto.placeIds.map((id, index) => ({
        place: { id: id },
        distance: routeDetails.distanceLegs[index] ?? 0,
        duration: routeDetails.durationLegs[index],
        position: index,
      })),
    );
    const route = this.routesRepository.create({
      coordinatesStart: dto.coordinatesStart,
      coordinatesEnd: dto.coordinatesEnd,
      distance: routeDetails.totalDistance,
      title: dto.title,
      duration: routeDetails.totalDuration,
      routePlaces: routePlaces,
      author: user,
      travelMode: dto.travelMode,
      lastRouteLegDistance: routeDetails.lastRouteLegDistance,
      lastRouteLegDuration: routeDetails.lastRouteLegDuration,
    });

    const { id } = await this.routesRepository.save(route);
    return { id };
  }

  async findMyRoutes(
    dto: RoutesListRequestDto,
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

    const res = await this.routesRepository.findAndCount({
      relations: { routePlaces: { place: { translations: true } } },
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      order: {
        createdAt:
          dto.orderBy === RoutesListOrderByEnum.CREATED_AT || !dto.orderBy
            ? orderDirection
            : undefined,
        title:
          dto.orderBy === RoutesListOrderByEnum.TITLE
            ? orderDirection
            : undefined,
        distance:
          dto.orderBy === RoutesListOrderByEnum.DISTANCE
            ? orderDirection
            : undefined,
        duration:
          dto.orderBy === RoutesListOrderByEnum.DURATION
            ? orderDirection
            : undefined,
        routePlaces: { position: 'asc' },
      },
      select: {
        routePlaces: {
          position: true,
          id: true,
          duration: true,
          distance: true,
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
        routePlaces: {
          place: {
            translations: {
              language: { id: langId },
            },
          },
        },
        createdAt: getDateWhereOption(),
        title:
          !!dto.search && dto.search.length > 0
            ? ILike(`%${dto.search}%`)
            : undefined,
      },
    });

    return res;
  }

  async findOne(id: number, langId: number, userId: number) {
    const res = await this.routesRepository.findOne({
      relations: { routePlaces: { place: { translations: true } } },
      select: {
        routePlaces: {
          position: true,
          id: true,
          duration: true,
          distance: true,
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
      order: { routePlaces: { position: 'asc' } },
      where: {
        // author: {
        //   id: userId,
        // },
        id: id,
        routePlaces: {
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

  async update(id: number, dto: UpdateRouteDto) {
    const places = await this.getPlacesByIds(dto.placeIds);
    const routeDetails = await this.googleMapsService.getRouteDetails(
      dto.coordinatesStart,
      dto.coordinatesEnd,
      places.map((p) => p.coordinates),
      dto.travelMode,
    );

    const routePlaces = await this.routesPlacesRepository.save(
      dto.placeIds.map((placeId, index) => ({
        route: { id },
        place: { id: placeId },
        distance: routeDetails.distanceLegs[index] ?? 0,
        duration: routeDetails.durationLegs[index],
        position: index,
      })),
    );
    const route = this.routesRepository.create({
      id,
      coordinatesStart: dto.coordinatesStart,
      coordinatesEnd: dto.coordinatesEnd,
      distance: routeDetails.totalDistance,
      title: dto.title,
      duration: routeDetails.totalDuration,
      routePlaces: routePlaces,
      travelMode: dto.travelMode,
      lastRouteLegDistance: routeDetails.lastRouteLegDistance,
      lastRouteLegDuration: routeDetails.lastRouteLegDuration,
    });

    await this.routesRepository.save(route);
    return { id };
  }

  async remove(id: number) {
    const deleted = await this.routesRepository.remove(
      this.routesRepository.create({ id }),
    );
    return { id };
  }

  async checkUserRelation(userId: number, routeId: number) {
    return await this.routesRepository.exists({
      where: {
        author: {
          id: Equal(userId),
        },
        id: Equal(routeId),
      },
    });
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
