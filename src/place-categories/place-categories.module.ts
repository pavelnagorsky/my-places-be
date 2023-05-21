import { Module } from '@nestjs/common';
import { PlaceCategoriesService } from './place-categories.service';
import { PlaceCategoriesController } from './place-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationsModule } from '../translations/translations.module';
import { PlaceCategory } from './entities/place-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlaceCategory]), TranslationsModule],
  controllers: [PlaceCategoriesController],
  providers: [PlaceCategoriesService],
})
export class PlaceCategoriesModule {}
