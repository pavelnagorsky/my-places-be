import { Module } from "@nestjs/common";
import { PlacesController } from "./places.controller";
import { PlacesService } from "./places.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Place } from "./entities/place.entity";
import { TranslationsModule } from "../AI/translations/translations.module";
import { PlaceType } from "./modules/place-types/entities/place-type.entity";
import { PlaceCategory } from "./modules/place-categories/entities/place-category.entity";
import { ImagesModule } from "../images/images.module";
import { PlaceTranslation } from "./entities/place-translation.entity";
import { MailingModule } from "../mailing/mailing.module";
import { Review } from "./modules/reviews/entities/review.entity";
import { SearchModule } from "./modules/search/search.module";
import { PlaceLikesModule } from "./modules/place-likes/place-likes.module";
import { PlaceCommentsModule } from "./modules/place-comments/place-comments.module";
import { PlaceTypesModule } from "./modules/place-types/place-types.module";
import { PlaceCategoriesModule } from "./modules/place-categories/place-categories.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { FavouritesModule } from "./modules/favourites/favourites.module";

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
    PlaceTypesModule,
    PlaceCategoriesModule,
    ReviewsModule,
    FavouritesModule,
  ],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [
    PlacesService,
    PlaceLikesModule,
    PlaceCommentsModule,
    PlaceTypesModule,
    SearchModule,
    PlaceCategoriesModule,
    ReviewsModule,
    FavouritesModule,
  ],
})
export class PlacesModule {}
