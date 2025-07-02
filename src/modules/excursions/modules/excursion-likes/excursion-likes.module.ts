import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExcursionLike } from "./entities/excursion-like.entity";
import { ExcursionLikesController } from "./excursion-likes.controller";
import { ExcursionLikesService } from "./excursion-likes.service";
import { Excursion } from "../../entities/excursion.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Excursion, ExcursionLike])],
  controllers: [ExcursionLikesController],
  providers: [ExcursionLikesService],
})
export class ExcursionLikesModule {}
