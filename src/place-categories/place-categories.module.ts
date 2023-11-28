import { Module } from '@nestjs/common';
import { PlaceCategoriesService } from './place-categories.service';
import { PlaceCategoriesController } from './place-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceCategory } from './entities/place-category.entity';
import { LanguagesModule } from '../languages/languages.module';
import { PlaceCategoryTitleTranslation } from './entities/place-category-title-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaceCategory, PlaceCategoryTitleTranslation]),
    LanguagesModule,
  ],
  controllers: [PlaceCategoriesController],
  providers: [PlaceCategoriesService],
})
export class PlaceCategoriesModule {}
