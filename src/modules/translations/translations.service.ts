import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationBaseEntity } from './entities/translation-base.entity';
import { Repository } from 'typeorm';
import { Language } from '../languages/entities/language.entity';
import { v2 } from '@google-cloud/translate';
import { ConfigService } from '@nestjs/config';
import { IGoogleCloudConfig } from '../../config/configuration';
import { LanguagesService } from '../languages/languages.service';
import slugify from 'slugify';

@Injectable()
export class TranslationsService {
  private readonly logger = new Logger('Translation service');

  constructor(
    @InjectRepository(TranslationBaseEntity)
    private translationsRepository: Repository<TranslationBaseEntity>,
    private configService: ConfigService,
    private languagesService: LanguagesService,
  ) {
    this.translateClient = new v2.Translate({
      key: this.configService.get<IGoogleCloudConfig>('googleCloud')?.apiKey,
      projectId:
        this.configService.get<IGoogleCloudConfig>('googleCloud')?.projectId,
    });
  }

  private translateClient: v2.Translate;

  async getAllLanguages(): Promise<Language[]> {
    return await this.languagesService.findAll();
  }

  parseToSlug(text: string) {
    const parsedSlug = slugify(text, {
      strict: true,
      lower: true,
    });
    return parsedSlug;
  }

  // translate by google
  private async translate(
    text: string,
    targetLanguageCode: string,
    sourceLanguageCode?: string,
  ): Promise<string> {
    try {
      const [translation] = await this.translateClient.translate(text, {
        from: sourceLanguageCode,
        to: targetLanguageCode,
      });

      return translation;
    } catch (e) {
      this.logger.error('Translation failed', e.message);
      return text;
    }
  }

  async createGoogleTranslation(
    text: string,
    targetLanguageCode: string,
    sourceLanguageId?: number,
  ): Promise<string> {
    let originalLanguage: Language | null = null;
    if (!!sourceLanguageId) {
      originalLanguage = await this.languagesService.findOneById(
        sourceLanguageId,
      );
    }
    return this.translate(text, targetLanguageCode, originalLanguage?.code);
  }

  // delete translation by id
  async deleteTranslation(id: number) {
    await this.translationsRepository.delete(id);
    return id;
  }

  // get all translations
  async getAll() {
    return await this.translationsRepository.find({
      loadRelationIds: true,
    });
  }
}
