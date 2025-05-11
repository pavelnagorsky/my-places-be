import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PlacesModule } from "./modules/places/places.module";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { PlaceTypesModule } from "./modules/place-types/place-types.module";
import { LanguagesModule } from "./modules/languages/languages.module";
import { TranslationsModule } from "./modules/translations/translations.module";
import { StorageModule } from "./modules/storage/storage.module";
import { ImagesModule } from "./modules/images/images.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { MailingModule } from "./modules/mailing/mailing.module";
import { PlaceCategoriesModule } from "./modules/place-categories/place-categories.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { LikesModule } from "./modules/likes/likes.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { FavouritesModule } from "./modules/favourites/favourites.module";
import { ScheduleModule } from "@nestjs/schedule";
import { CacheModule } from "@nestjs/cache-manager";
import { SearchModule } from "./modules/search/search.module";
import { RoutesModule } from "./modules/routes/routes.module";
import { ExcursionsModule } from "./modules/excursions/excursions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      cache: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3 * 60 * 60 * 1000, // 3h
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    PlacesModule,
    PlaceTypesModule,
    LanguagesModule,
    TranslationsModule,
    StorageModule,
    ImagesModule,
    AuthModule,
    UsersModule,
    RolesModule,
    MailingModule,
    PlaceCategoriesModule,
    CommentsModule,
    ReviewsModule,
    LikesModule,
    ReportsModule,
    FeedbackModule,
    FavouritesModule,
    SearchModule,
    RoutesModule,
    ExcursionsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
