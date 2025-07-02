import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Equal, Repository } from "typeorm";
import { ExcursionComment } from "./entities/excursion-comment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../../users/entities/user.entity";
import { UpdateCommentDto } from "../../../places/modules/place-comments/dto/update-comment.dto";
import { CreateCommentDto } from "../../../places/modules/place-comments/dto/create-comment.dto";
import { Excursion } from "../../entities/excursion.entity";
@Injectable()
export class ExcursionCommentsService {
  constructor(
    @InjectRepository(ExcursionComment)
    private readonly commentsRepository: Repository<ExcursionComment>
  ) {}

  async checkCanManage(userId: number, commentId: number) {
    // check if user is owner of comment
    return await this.commentsRepository.exists({
      where: {
        user: {
          id: Equal(userId),
        },
        id: Equal(commentId),
      },
    });
  }

  async findAllExcursionComments(excursionId: number, userId?: number) {
    const comments = await this.commentsRepository.find({
      relations: {
        user: true,
      },
      where: {
        excursion: {
          id: Equal(excursionId),
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

  private async findOneExcursionComment(commentId: number, canManage: boolean) {
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

  async createExcursionComment(
    excursionId: number,
    userId: number,
    createCommentDto: CreateCommentDto
  ) {
    const comment = new ExcursionComment();
    comment.excursion = new Excursion();
    comment.excursion.id = excursionId;
    comment.user = new User();
    comment.user.id = userId;
    comment.text = createCommentDto.text;
    const saved = await this.commentsRepository.save(comment);
    return this.findOneExcursionComment(saved.id, true);
  }

  async updateComment(commentId: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentsRepository.findOne({
      where: { id: Equal(commentId) },
    });
    if (!comment) throw new NotFoundException({ message: "Comment not found" });
    comment.text = updateCommentDto.text;
    const saved = await this.commentsRepository.save(comment);
    return this.findOneExcursionComment(saved.id, true);
  }

  async deleteComment(id: number) {
    const result = await this.commentsRepository.delete({ id: Equal(id) });
    if (typeof result.affected === "number" && result.affected > 0) return true;
    throw new BadRequestException({ message: "Comment not found" });
  }
}
