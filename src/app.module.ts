import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PlacesModule } from './places/places.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { PlaceTypesModule } from './place-types/place-types.module';
import { LanguagesModule } from './languages/languages.module';
import { TranslationsModule } from './translations/translations.module';
import { StorageModule } from './storage/storage.module';
import { ImagesModule } from './images/images.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MailingModule } from './mailing/mailing.module';
import { PlaceCategoriesModule } from './place-categories/place-categories.module';
import { CommentsModule } from './comments/comments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { LikesModule } from './likes/likes.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    PlacesModule,
    DatabaseModule,
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
  ],
  controllers: [AppController],
})
export class AppModule {}
