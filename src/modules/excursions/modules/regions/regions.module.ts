import { Module } from "@nestjs/common";
import { RegionsService } from "./regions.service";
import { RegionsController } from "./regions.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlaceType } from "../../../places/modules/place-types/entities/place-type.entity";
import { PlaceTypeTranslation } from "../../../places/modules/place-types/entities/place-type-translation.entity";
import { TranslationsModule } from "../../../AI/translations/translations.module";
import { Region } from "./entities/region.entity";
import { RegionTranslation } from "./entities/region-translation.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Region, RegionTranslation]),
    TranslationsModule,
  ],
  controllers: [RegionsController],
  providers: [RegionsService],
})
export class RegionsModule {}
