import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { RoutePlace } from './entities/route-place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Route, RoutePlace])],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
