import { Module } from "@nestjs/common";
import { PlaceCategoriesService } from "./place-categories.service";
import { PlaceCategoriesController } from "./place-categories.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlaceCategory } from "./entities/place-category.entity";
import { PlaceCategoryTranslation } from "./entities/place-category-translation.entity";
import { TranslationsModule } from "../../../AI/translations/translations.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaceCategory, PlaceCategoryTranslation]),
    TranslationsModule,
  ],
  controllers: [PlaceCategoriesController],
  providers: [PlaceCategoriesService],
})
export class PlaceCategoriesModule {}
