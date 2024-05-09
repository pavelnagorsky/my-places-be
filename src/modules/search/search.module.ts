import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from '../places/entities/place.entity';
import { PlaceTranslation } from '../places/entities/place-translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Place, PlaceTranslation])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
