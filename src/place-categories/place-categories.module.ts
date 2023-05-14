import { Module } from '@nestjs/common';
import { PlaceCategoriesService } from './place-categories.service';
import { PlaceCategoriesController } from './place-categories.controller';

@Module({
  controllers: [PlaceCategoriesController],
  providers: [PlaceCategoriesService]
})
export class PlaceCategoriesModule {}
