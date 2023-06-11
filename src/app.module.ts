import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { MailingService } from './mailing/mailing.service';
import { PlaceCategoriesModule } from './place-categories/place-categories.module';
import { CommentsModule } from './comments/comments.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
