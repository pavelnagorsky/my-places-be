import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from '../places/entities/place.entity';
import { PlaceTranslation } from '../places/entities/place-translation.entity';
import { HttpModule } from '@nestjs/axios';
import { Review } from '../reviews/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, PlaceTranslation, Review]),
    HttpModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
