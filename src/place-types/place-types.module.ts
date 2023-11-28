import { Module } from '@nestjs/common';
import { PlaceTypesService } from './place-types.service';
import { PlaceTypesController } from './place-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceType } from './entities/place-type.entity';
import { LanguagesModule } from '../languages/languages.module';
import { PlaceTypeTitleTranslation } from './entities/place-type-title-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaceType, PlaceTypeTitleTranslation]),
    LanguagesModule,
  ],
  controllers: [PlaceTypesController],
  providers: [PlaceTypesService],
})
export class PlaceTypesModule {}
