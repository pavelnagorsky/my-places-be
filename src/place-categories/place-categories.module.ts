import { Module } from '@nestjs/common';
import { PlaceCategoriesService } from './place-categories.service';
import { PlaceCategoriesController } from './place-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceCategory } from './entities/place-category.entity';
import { PlaceCategoryTitleTranslation } from './entities/place-category-title-translation.entity';
import { TranslationsModule } from '../translations/translations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaceCategory, PlaceCategoryTitleTranslation]),
    TranslationsModule,
  ],
  controllers: [PlaceCategoriesController],
  providers: [PlaceCategoriesService],
})
export class PlaceCategoriesModule {}
