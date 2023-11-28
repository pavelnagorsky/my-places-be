import { Module } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationBaseEntity } from './entities/translation-base.entity';
import { Language } from '../languages/entities/language.entity';
import { TranslationsController } from './translations.controller';
import { LanguagesModule } from '../languages/languages.module';

@Module({
  //controllers: [TranslationsController],
  imports: [
    TypeOrmModule.forFeature([TranslationBaseEntity, Language]),
    LanguagesModule,
  ],
  providers: [TranslationsService],
  exports: [TranslationsService],
})
export class TranslationsModule {}
