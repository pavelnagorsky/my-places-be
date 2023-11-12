import { Module } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Translation } from './entities/translation.entity';
import { Language } from '../languages/entities/language.entity';
import { TranslationsController } from './translations.controller';
import { LanguagesModule } from '../languages/languages.module';

@Module({
  //controllers: [TranslationsController],
  imports: [TypeOrmModule.forFeature([Translation, Language]), LanguagesModule],
  providers: [TranslationsService],
  exports: [TranslationsService],
})
export class TranslationsModule {}
