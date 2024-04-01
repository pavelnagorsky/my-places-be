import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { TranslationsModule } from '../translations/translations.module';
import { PlaceType } from '../place-types/entities/place-type.entity';
import { PlaceCategory } from '../place-categories/entities/place-category.entity';
import { ImagesModule } from '../images/images.module';
import { PlaceTranslation } from './entities/place-translation.entity';
import { MailingModule } from '../mailing/mailing.module';
import { Review } from '../reviews/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Place,
      PlaceType,
      PlaceCategory,
      PlaceTranslation,
      Review,
    ]),
    ImagesModule,
    TranslationsModule,
    MailingModule,
  ],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService],
})
export class PlacesModule {}
