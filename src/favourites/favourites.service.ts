import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlacesService } from '../places/places.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favourite } from './entities/favourite.entity';

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

  async findAllByUser(userId: number, langId: number) {
    return await this.favouritesRepository.find({
      where: {
        user: {
          id: userId,
        },
        place: {
          translations: {
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
    });
  }

  async updateIsActual(id: number, userId: number) {
    const fav = await this.favouritesRepository.findOne({
      where: { id: id, user: { id: userId } },
    });
    if (!fav)
      throw new NotFoundException({
        message: 'Favourite not found',
      });
    fav.actual = !fav.actual;
    await this.favouritesRepository.save(fav);
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
