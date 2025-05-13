import { Module } from "@nestjs/common";
import { ExcursionsService } from "./excursions.service";
import { ExcursionsController } from "./excursions.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Place } from "../places/entities/place.entity";
import { Excursion } from "./entities/excursion.entity";
import { ExcursionTranslation } from "./entities/excursion-translation.entity";
import { ExcursionPlace } from "./entities/excursion-place.entity";
import { ExcursionPlaceTranslation } from "./entities/excursion-place-translation.entity";
import { GoogleMapsModule } from "../google-maps/google-maps.module";
import { TranslationsModule } from "../translations/translations.module";
import { MailingModule } from "../mailing/mailing.module";
import { RegionsModule } from "../regions/regions.module";

@Module({
  imports: [
    GoogleMapsModule,
    TranslationsModule,
    MailingModule,
    RegionsModule,
    TypeOrmModule.forFeature([
      Excursion,
      ExcursionTranslation,
      ExcursionPlace,
      ExcursionPlaceTranslation,
      Place,
    ]),
  ],
  controllers: [ExcursionsController],
  providers: [ExcursionsService],
  exports: [RegionsModule],
})
export class ExcursionsModule {}
