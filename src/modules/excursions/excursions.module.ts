import { Module } from '@nestjs/common';
import { ExcursionsService } from './excursions.service';
import { ExcursionsController } from './excursions.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from '../places/entities/place.entity';
import { Excursion } from './entities/excursion.entity';
import { ExcursionTranslation } from './entities/excursion-translation.entity';
import { ExcursionPlace } from './entities/excursion-place.entity';
import { ExcursionPlaceTranslation } from './entities/excursion-place-translation.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Excursion,
      ExcursionTranslation,
      ExcursionPlace,
      ExcursionPlaceTranslation,
      Place,
    ]),
  ],
  controllers: [ExcursionsController],
  providers: [ExcursionsService],
})
export class ExcursionsModule {}
