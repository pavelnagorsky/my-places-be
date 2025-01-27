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
import { ConfigService } from '@nestjs/config';
import { Place } from '../places/entities/place.entity';
import { PlaceStatusesEnum } from '../places/enums/place-statuses.enum';

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
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateRouteDto, user: User) {
    const places = await this.getPlacesByIds(dto.placeIds);
    const routeDetails = await this.getRouteDetails(
      dto.coordinatesStart,
      dto.coordinatesEnd,
      places.map((p) => p.coordinates),
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
      timeStart: new Date(dto.timeStart),
      author: user,
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
        author: {
          id: userId,
        },
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
    const routeDetails = await this.getRouteDetails(
      dto.coordinatesStart,
      dto.coordinatesEnd,
      places.map((p) => p.coordinates),
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
      timeStart: new Date(dto.timeStart),
      routePlaces: routePlaces,
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

  private getLatLng(coordinates: string) {
    const latLng = coordinates.split(';');
    const lat = latLng[0] ? +latLng[0] : 1;
    const lng = latLng[1] ? +latLng[1] : 1;
    return {
      lat,
      lng,
    };
  }

  private async getRouteDetails(
    startCoordinates: string,
    endCoordinates: string,
    waypointsCoordinates: string[],
  ) {
    const startLatLng = this.getLatLng(startCoordinates);
    const endLatLng = this.getLatLng(endCoordinates);
    const waypoints = waypointsCoordinates.map((c) => this.getLatLng(c));
    // Create waypoints string
    const waypointsString = waypoints
      .map((wp) => `${wp.lat},${wp.lng}`)
      .join('|');
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
      startLatLng.lat
    },${startLatLng.lng}&destination=${endLatLng.lat},${
      endLatLng.lng
    }&waypoints=${waypointsString}&mode=driving&mode=driving&key=${
      this.configService.get<IGoogleCloudConfig>('googleCloud')?.apiKey
    }`;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IGoogleDirectionsApiResponse>(url),
      );
      if (data.status === 'OK' && !!data.routes) {
        const route = data.routes[0];
        const distanceLegs = route.legs.map((leg) => leg.distance.value / 1000); // KM
        const durationLegs = route.legs.map((leg) => leg.duration.value / 60); // Minutes
        const totalDistance = distanceLegs.reduce(
          (prev, current) => prev + (current ?? 0),
          0,
        );
        const totalDuration = durationLegs.reduce(
          (prev, current) => prev + (current ?? 0),
          0,
        );

        return { distanceLegs, durationLegs, totalDistance, totalDuration };
      } else {
        throw data;
      }
    } catch (e) {
      this.logger.error(`Error fetching paths`, e);
      throw new BadRequestException({
        message: 'Incorrect route coordinates',
      });
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
