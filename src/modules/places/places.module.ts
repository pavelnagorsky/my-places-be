import { Module } from "@nestjs/common";
import { PlacesController } from "./places.controller";
import { PlacesService } from "./places.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Place } from "./entities/place.entity";
import { TranslationsModule } from "../translations/translations.module";
import { PlaceType } from "../place-types/entities/place-type.entity";
import { PlaceCategory } from "../place-categories/entities/place-category.entity";
import { ImagesModule } from "../images/images.module";
import { PlaceTranslation } from "./entities/place-translation.entity";
import { MailingModule } from "../mailing/mailing.module";
import { Review } from "../reviews/entities/review.entity";
import { SearchModule } from "../search/search.module";
import { PlaceLikesModule } from "./modules/place-likes/place-likes.module";
import { PlaceCommentsModule } from "./modules/place-comments/place-comments.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Place,
      PlaceType,
      PlaceCategory,
      PlaceTranslation,
      Review,
    ]),
    PlaceLikesModule,
    PlaceCommentsModule,
    ImagesModule,
    TranslationsModule,
    MailingModule,
    SearchModule,
  ],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService, PlaceLikesModule, PlaceCommentsModule],
})
export class PlacesModule {}
