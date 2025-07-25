import { Module } from "@nestjs/common";
import { PlaceTypesService } from "./place-types.service";
import { PlaceTypesController } from "./place-types.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlaceType } from "./entities/place-type.entity";
import { PlaceTypeTranslation } from "./entities/place-type-translation.entity";
import { TranslationsModule } from "../../../AI/translations/translations.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaceType, PlaceTypeTranslation]),
    TranslationsModule,
  ],
  controllers: [PlaceTypesController],
  providers: [PlaceTypesService],
})
export class PlaceTypesModule {}
