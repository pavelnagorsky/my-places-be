import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from '../places/entities/place.entity';
import { PlaceTranslation } from '../places/entities/place-translation.entity';
import { Review } from '../reviews/entities/review.entity';
import { GoogleMapsModule } from '../google-maps/google-maps.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, PlaceTranslation, Review]),
    GoogleMapsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
