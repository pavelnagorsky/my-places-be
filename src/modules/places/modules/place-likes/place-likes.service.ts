import { Equal, Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Place } from "../../entities/place.entity";
import { PlaceLike } from "./entities/place-like.entity";
import { User } from "../../../users/entities/user.entity";
import { Excursion } from "../../../excursions/entities/excursion.entity";

export class PlaceLikesService {
  constructor(
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(PlaceLike)
    private likesRepository: Repository<PlaceLike>
  ) {}

  async checkPlaceLikedByUser(userId: number, placeId: number) {
    const likeExists = await this.likesRepository.exists({
      where: {
        place: {
          id: placeId,
        },
        user: {
          id: Equal(userId),
        },
      },
    });
    return likeExists;
  }

  async changePlaceLike(userId: number, placeId: number) {
    const place = await this.placesRepository.findOne({
      where: { id: Equal(placeId) },
      select: {
        id: true,
        likesCount: true,
      },
    });
    if (!place) throw new NotFoundException({ message: "Place not found" });
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
      place.likesCount = place.likesCount > 0 ? place.likesCount - 1 : 0;
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
      place.likesCount = place.likesCount + 1;
      const like = this.createPlaceLike(placeId, userId);
      like.place.id = placeId;
      like.user.id = userId;
      await this.likesRepository.save(like);
      // place.likes.push(savedLike);
      await this.placesRepository.save(place);
      return;
    }
  }

  private createPlaceLike(placeId: number, userId: number) {
    const like = this.likesRepository.create();
    like.place = new Place();
    like.user = new User();
    like.place.id = placeId;
    like.user.id = userId;
    return like;
  }
}
