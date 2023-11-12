import { Module } from '@nestjs/common';
import { PlaceCategoriesService } from './place-categories.service';
import { PlaceCategoriesController } from './place-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceCategory } from './entities/place-category.entity';
import { LanguagesModule } from '../languages/languages.module';
import { TranslationsModule } from '../translations/translations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaceCategory]),
    LanguagesModule,
    TranslationsModule,
  ],
  controllers: [PlaceCategoriesController],
  providers: [PlaceCategoriesService],
})
export class PlaceCategoriesModule {}
