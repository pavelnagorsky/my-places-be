import { Module } from '@nestjs/common';
import { PlaceTypesService } from './place-types.service';
import { PlaceTypesController } from './place-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceType } from './entities/place-type.entity';
import { TranslationsModule } from '../translations/translations.module';
import { LanguagesModule } from '../languages/languages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaceType]),
    TranslationsModule,
    LanguagesModule,
  ],
  controllers: [PlaceTypesController],
  providers: [PlaceTypesService],
})
export class PlaceTypesModule {}
