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

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
  ) {}

  async create(dto: CreateRouteDto, user: User) {
    const route = this.routesRepository.create({
      ...dto,
      places: dto.placeIds.map((id) => ({ id })),
      author: user,
    });

    const { id } = await this.routesRepository.save(route);
    return id;
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
        createdAt:
          dto.orderBy === RoutesListOrderByEnum.CREATED_AT || !dto.orderBy
            ? orderDirection
            : undefined,
      },
      relations: { places: true },
      where: {
        author: {
          id: tokenPayload.id,
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
    const route = this.routesRepository.create({
      ...dto,
      places: dto.placeIds.map((id) => ({ id })),
      id,
    });

    await this.routesRepository.save(route);
    return id;
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
