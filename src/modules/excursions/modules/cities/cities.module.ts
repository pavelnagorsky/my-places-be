import { Module } from "@nestjs/common";
import { CitiesService } from "./cities.service";
import { CitiesController } from "./cities.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlaceType } from "../../../places/modules/place-types/entities/place-type.entity";
import { PlaceTypeTranslation } from "../../../places/modules/place-types/entities/place-type-translation.entity";
import { TranslationsModule } from "../../../AI/translations/translations.module";
import { City } from "./entities/city.entity";
import { CityTranslation } from "./entities/city-translation.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([City, CityTranslation]),
    TranslationsModule,
  ],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
