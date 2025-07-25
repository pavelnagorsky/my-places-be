import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Equal, Repository } from "typeorm";
import { PlaceComment } from "./entities/place-comment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { Place } from "../../entities/place.entity";
import { User } from "../../../users/entities/user.entity";
import { UpdateCommentDto } from "./dto/update-comment.dto";

@Injectable()
export class PlaceCommentsService {
  constructor(
    @InjectRepository(PlaceComment)
    private readonly commentsRepository: Repository<PlaceComment>
  ) {}

  async checkCanManage(userId: number, commentId: number) {
    // check if user is owner of comment
    return await this.commentsRepository.exist({
      where: {
        user: {
          id: Equal(userId),
        },
        id: Equal(commentId),
      },
    });
  }

  async findAllPlaceComments(placeId: number, userId?: number) {
    const comments = await this.commentsRepository.find({
      relations: {
        user: true,
      },
      where: {
        place: {
          id: Equal(placeId),
        },
      },
      order: {
        createdAt: "desc",
      },
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    });
    return comments;
  }

  private async findOnePlaceComment(commentId: number, canManage: boolean) {
    const comment = await this.commentsRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        id: Equal(commentId),
      },
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    });
    if (!comment)
      throw new NotFoundException({ message: "Comment was not found" });
    return { ...comment, canManage: canManage };
  }

  async createPlaceComment(
    placeId: number,
    userId: number,
    createCommentDto: CreateCommentDto
  ) {
    const comment = new PlaceComment();
    comment.place = new Place();
    comment.place.id = placeId;
    comment.user = new User();
    comment.user.id = userId;
    comment.text = createCommentDto.text;
    const saved = await this.commentsRepository.save(comment);
    return this.findOnePlaceComment(saved.id, true);
  }

  async updateComment(commentId: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentsRepository.findOne({
      where: { id: Equal(commentId) },
    });
    if (!comment) throw new NotFoundException({ message: "Comment not found" });
    comment.text = updateCommentDto.text;
    const saved = await this.commentsRepository.save(comment);
    return this.findOnePlaceComment(saved.id, true);
  }

  async deleteComment(id: number) {
    const result = await this.commentsRepository.delete({ id: Equal(id) });
    if (typeof result.affected === "number" && result.affected > 0) return true;
    throw new BadRequestException({ message: "Comment not found" });
  }
}
