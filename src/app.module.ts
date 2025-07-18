import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PlacesModule } from "./modules/places/places.module";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { LanguagesModule } from "./modules/languages/languages.module";
import { TranslationsModule } from "./modules/AI/translations/translations.module";
import { StorageModule } from "./modules/storage/storage.module";
import { ImagesModule } from "./modules/images/images.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { MailingModule } from "./modules/mailing/mailing.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { ScheduleModule } from "@nestjs/schedule";
import { CacheModule } from "@nestjs/cache-manager";
import { RoutesModule } from "./modules/routes/routes.module";
import { ExcursionsModule } from "./modules/excursions/excursions.module";
import { SpeechKitModule } from "./modules/AI/speech-kit/speech-kit.module";

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
    LanguagesModule,
    TranslationsModule,
    StorageModule,
    ImagesModule,
    AuthModule,
    UsersModule,
    RolesModule,
    MailingModule,
    ReportsModule,
    FeedbackModule,
    RoutesModule,
    ExcursionsModule,
    SpeechKitModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
