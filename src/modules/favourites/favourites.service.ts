import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlacesService } from '../places/places.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Favourite } from './entities/favourite.entity';
import { FavouritesRequestDto } from './dto/favourites-request.dto';
import { UpdateIsActualDto } from './dto/update-is-actual.dto';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectRepository(Favourite)
    private readonly favouritesRepository: Repository<Favourite>,
    private readonly placesService: PlacesService,
  ) {}

  async create(userId: number, placeId: number) {
    const placeExists = await this.placesService.checkExist(placeId);
    if (!placeExists)
      throw new BadRequestException({
        message: 'Place not found',
      });
    const alreadyExists = await this.favouritesRepository.exist({
      where: {
        user: {
          id: userId,
        },
        place: {
          id: placeId,
        },
      },
    });
    if (alreadyExists)
      throw new BadRequestException({
        message: 'Place is already in favourites',
      });
    const fav = this.favouritesRepository.create({
      place: {
        id: placeId,
      },
      user: {
        id: userId,
      },
    });

    return await this.favouritesRepository.save(fav);
  }

  async findAllByUser(
    userId: number,
    dto: FavouritesRequestDto,
    langId: number,
  ) {
    const getDateWhereOption = () => {
      if (!!dto.dateFrom && !!dto.dateTo)
        return Between(new Date(dto.dateFrom), new Date(dto.dateTo));
      if (!!dto.dateFrom) return MoreThanOrEqual(new Date(dto.dateFrom));
      if (!!dto.dateTo) return LessThanOrEqual(new Date(dto.dateTo));
      return undefined;
    };

    return await this.favouritesRepository.find({
      where: {
        user: {
          id: userId,
        },
        createdAt: getDateWhereOption(),
        place: {
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
      },
      relations: {
        place: {
          translations: true,
        },
      },
      select: {
        id: true,
        actual: true,
        createdAt: true,
        place: {
          id: true,
          slug: true,
          translations: {
            title: true,
          },
        },
      },
      order: {
        actual: 'desc',
        createdAt: 'desc',
      },
    });
  }

  async updateIsActual(id: number, dto: UpdateIsActualDto, userId: number) {
    await this.favouritesRepository.update(
      {
        id: id,
        user: { id: userId },
      },
      { id, actual: dto.isActual },
    );
    return;
  }

  async remove(id: number, userId: number) {
    const fav = await this.favouritesRepository.findOne({
      where: { id: id, user: { id: userId } },
    });
    if (!fav)
      throw new NotFoundException({
        message: 'Favourite not found',
      });
    await this.favouritesRepository.remove(fav);
    return;
  }
}
