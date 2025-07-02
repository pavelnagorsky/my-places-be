import { Module } from "@nestjs/common";
import { ExcursionCommentsService } from "./excursion-comments.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExcursionComment } from "./entities/excursion-comment.entity";
import { ExcursionCommentsController } from "./excursion-comments.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ExcursionComment])],
  providers: [ExcursionCommentsService],
  controllers: [ExcursionCommentsController],
})
export class ExcursionCommentsModule {}
