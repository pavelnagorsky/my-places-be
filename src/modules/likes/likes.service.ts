import { Equal, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from '../places/entities/place.entity';
import { Like } from './entities/like.entity';
import { User } from '../users/entities/user.entity';

export class LikesService {
  constructor(
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
  ) {}

  private createPlaceLike() {
    const like = this.likesRepository.create();
    like.place = new Place();
    like.user = new User();
    return like;
  }

  async checkPlaceLikedByUser(userId: number, placeId: number) {
    const likeExists = await this.placesRepository.exists({
      relations: ['likes'],
      where: {
        id: Equal(placeId),
        likes: {
          user: {
            id: Equal(userId),
          },
        },
      },
    });
    return likeExists;
  }

  async changePlaceLike(userId: number, placeId: number) {
    const place = await this.placesRepository.findOne({
      where: { id: Equal(placeId) },
      relations: {
        likes: true,
      },
      select: {
        id: true,
        likes: true,
        likesCount: true,
      },
    });
    if (!place) throw new NotFoundException({ message: 'Place not found' });
    const likeExists = await this.likesRepository.exists({
      where: {
        user: {
          id: Equal(userId),
        },
        place: {
          id: Equal(placeId),
        },
      },
    });
    if (likeExists) {
      place.likesCount = --place.likesCount;
      await this.likesRepository.delete({
        place: {
          id: Equal(placeId),
        },
        user: {
          id: Equal(userId),
        },
      });
      await this.placesRepository.save(place);
      return;
    } else {
      place.likesCount = ++place.likesCount;
      const like = this.createPlaceLike();
      like.place.id = placeId;
      like.user.id = userId;
      const savedLike = await this.likesRepository.save(like);
      place.likes.push(savedLike);
      await this.placesRepository.save(place);
      return;
    }
  }
}
