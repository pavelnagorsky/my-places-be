import { Module } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationBaseEntity } from './entities/translation-base.entity';
import { LanguagesModule } from '../languages/languages.module';

@Module({
  //controllers: [TranslationsController],
  imports: [TypeOrmModule.forFeature([TranslationBaseEntity]), LanguagesModule],
  providers: [TranslationsService],
  exports: [TranslationsService],
})
export class TranslationsModule {}
