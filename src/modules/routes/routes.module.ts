import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { RoutePlace } from './entities/route-place.entity';
import { HttpModule } from '@nestjs/axios';
import { Place } from '../places/entities/place.entity';
import { GoogleMapsModule } from '../google-maps/google-maps.module';

@Module({
  imports: [
    GoogleMapsModule,
    TypeOrmModule.forFeature([Route, RoutePlace, Place]),
  ],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
