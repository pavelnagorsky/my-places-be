import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Place } from "../../entities/place.entity";
import { PlaceLike } from "./entities/place-like.entity";
import { PlaceLikesController } from "./place-likes.controller";
import { PlaceLikesService } from "./place-likes.service";

@Module({
  imports: [TypeOrmModule.forFeature([Place, PlaceLike])],
  controllers: [PlaceLikesController],
  providers: [PlaceLikesService],
})
export class PlaceLikesModule {}
