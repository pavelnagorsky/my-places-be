import { Module } from "@nestjs/common";
import { PlaceCommentsService } from "./place-comments.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlaceComment } from "./entities/place-comment.entity";
import { PlaceCommentsController } from "./place-comments.controller";

@Module({
  imports: [TypeOrmModule.forFeature([PlaceComment])],
  providers: [PlaceCommentsService],
  controllers: [PlaceCommentsController],
})
export class PlaceCommentsModule {}
