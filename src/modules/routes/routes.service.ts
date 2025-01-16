import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  Equal,
  ILike,
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

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(RoutePlace)
    private routesPlacesRepository: Repository<RoutePlace>,
  ) {}

  async create(dto: CreateRouteDto, user: User) {
    const routePlaces = await this.routesPlacesRepository.save(
      dto.placeIds.map((id, index) => ({
        place: { id: id },
        position: index,
      })),
    );
    const route = this.routesRepository.create({
      coordinatesStart: dto.coordinatesStart,
      coordinatesEnd: dto.coordinatesEnd,
      distance: dto.distance,
      title: dto.title,
      duration: dto.duration,
      routePlaces: routePlaces,
      author: user,
    });

    const { id } = await this.routesRepository.save(route);
    return { id };
  }

  async findMyRoutes(
    langId: number,
    dto: RoutesListRequestDto,
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
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      order: {
        routePlaces: { position: 'asc' },
        createdAt:
          dto.orderBy === RoutesListOrderByEnum.CREATED_AT || !dto.orderBy
            ? orderDirection
            : undefined,
      },
      relations: { routePlaces: { place: { translations: true } } },
      select: {
        routePlaces: {
          position: true,
          id: true,
          place: {
            slug: true,
            id: true,
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

  findOne(id: number) {
    return `This action returns a #${id} route`;
  }

  async update(id: number, dto: UpdateRouteDto) {
    const routePlaces = await this.routesPlacesRepository.save(
      dto.placeIds.map((placeId, index) => ({
        route: { id },
        place: { id: placeId },
        position: index,
      })),
    );
    const route = this.routesRepository.create({
      id,
      coordinatesStart: dto.coordinatesStart,
      coordinatesEnd: dto.coordinatesEnd,
      distance: dto.distance,
      title: dto.title,
      duration: dto.duration,
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
}
