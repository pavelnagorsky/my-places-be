import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { TranslationsModule } from '../translations/translations.module';
import { PlaceType } from '../place-types/entities/place-type.entity';
import { PlaceCategory } from '../place-categories/entities/place-category.entity';
import { ImagesModule } from '../images/images.module';
import { PlaceTitleTranslation } from './entities/place-title-translation.entity';
import { PlaceDescriptionTranslation } from './entities/place-description-translation.entity';
import { PlaceAddressTranslation } from './entities/place-address-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Place,
      PlaceType,
      PlaceCategory,
      PlaceTitleTranslation,
      PlaceDescriptionTranslation,
      PlaceAddressTranslation,
    ]),
    ImagesModule,
    TranslationsModule,
  ],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService],
})
export class PlacesModule {}
