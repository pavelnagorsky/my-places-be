import { Module } from '@nestjs/common';
import { PlaceTypesService } from './place-types.service';
import { PlaceTypesController } from './place-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceType } from './entities/place-type.entity';
import { PlaceTypeTitleTranslation } from './entities/place-type-title-translation.entity';
import { TranslationsModule } from '../translations/translations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaceType, PlaceTypeTitleTranslation]),
    TranslationsModule,
  ],
  controllers: [PlaceTypesController],
  providers: [PlaceTypesService],
})
export class PlaceTypesModule {}
