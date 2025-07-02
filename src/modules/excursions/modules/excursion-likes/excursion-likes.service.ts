import { Equal, Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ExcursionLike } from "./entities/excursion-like.entity";
import { User } from "../../../users/entities/user.entity";
import { Excursion } from "../../entities/excursion.entity";

export class ExcursionLikesService {
  constructor(
    @InjectRepository(Excursion)
    private excursionsRepository: Repository<Excursion>,
    @InjectRepository(ExcursionLike)
    private likesRepository: Repository<ExcursionLike>
  ) {}

  async checkPlaceLikedByUser(userId: number, excursionId: number) {
    const likeExists = await this.likesRepository.exists({
      where: {
        excursion: {
          id: excursionId,
        },
        user: {
          id: Equal(userId),
        },
      },
    });
    return likeExists;
  }

  async changeExcursionLike(userId: number, excursionId: number) {
    const excursion = await this.excursionsRepository.findOne({
      where: { id: Equal(excursionId) },
      select: {
        id: true,
        likesCount: true,
      },
    });
    if (!excursion)
      throw new NotFoundException({ message: "Excursion not found" });
    const likeExists = await this.likesRepository.exists({
      where: {
        user: {
          id: Equal(userId),
        },
        excursion: {
          id: Equal(excursionId),
        },
      },
    });
    if (likeExists) {
      excursion.likesCount =
        excursion.likesCount > 0 ? excursion.likesCount - 1 : 0;
      await this.likesRepository.delete({
        excursion: {
          id: Equal(excursionId),
        },
        user: {
          id: Equal(userId),
        },
      });
      await this.excursionsRepository.save(excursion);
      return;
    } else {
      excursion.likesCount = excursion.likesCount + 1;
      const like = this.createExcursionLike(excursionId, userId);
      await this.likesRepository.save(like);
      await this.excursionsRepository.save(excursion);
      return;
    }
  }

  private createExcursionLike(excursionId: number, userId: number) {
    const like = this.likesRepository.create();
    like.excursion = new Excursion();
    like.user = new User();
    like.excursion.id = excursionId;
    like.user.id = userId;
    return like;
  }
}
