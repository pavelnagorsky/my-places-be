import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TranslationBaseEntity } from './entities/translation-base.entity';
import { Repository } from 'typeorm';
import { Language } from '../languages/entities/language.entity';
import { ConfigService } from '@nestjs/config';
import { IYandexCloudConfig } from '../../config/configuration';
import { LanguagesService } from '../languages/languages.service';
import slugify from 'slugify';
import { HttpService } from '@nestjs/axios';
import {
  IYandexDetectLanguageRequest,
  IYandexDetectLanguageResponse,
  IYandexTranslateRequest,
  IYandexTranslateResponse,
  languageCodeHints,
} from './interfaces/translation.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TranslationsService implements OnModuleInit {
  private readonly logger = new Logger('Translation service');

  constructor(
    @InjectRepository(TranslationBaseEntity)
    private translationsRepository: Repository<TranslationBaseEntity>,
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private languagesService: LanguagesService,
  ) {}

  private setupInterceptors() {
    const axiosRef = this.httpService.axiosRef;
    const apiKey =
      this.configService.get<IYandexCloudConfig>('yandexCloud')?.apiKey;
    axiosRef.interceptors.request.use(
      async (reqConfig) => {
        reqConfig.baseURL =
          'https://translate.api.cloud.yandex.net/translate/v2';
        reqConfig.headers['Authorization'] = `Api-Key ${apiKey}`;
        return reqConfig;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  async onModuleInit(): Promise<void> {
    this.setupInterceptors();
  }

  private allLanguages: Language[] = [];

  async getAllLanguages(): Promise<Language[]> {
    if (this.allLanguages.length > 0) {
      this.logger.log('Using cached list of languages');
      return this.allLanguages;
    }
    const languages = await this.languagesService.findAll();
    this.allLanguages = languages;
    return this.allLanguages;
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
      const requestBody: IYandexTranslateRequest = {
        format: 'HTML',
        sourceLanguageCode: sourceLanguageCode,
        targetLanguageCode: targetLanguageCode,
        texts: [text],
      };
      const { data } = await firstValueFrom(
        this.httpService.post<IYandexTranslateResponse>(
          '/translate',
          requestBody,
        ),
      );
      return data.translations[0]?.text || '';
    } catch (e) {
      this.logger.error('Translation failed', e.message);
      return text;
    }
  }

  async createTranslation(
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

  // detect language code of text with Google service
  private async detectLanguage(text: string) {
    try {
      const requestBody: IYandexDetectLanguageRequest = {
        languageCodeHints,
        text: text.slice(0, 1000),
      };
      const { data } = await firstValueFrom(
        this.httpService.post<IYandexDetectLanguageResponse>(
          '/detect',
          requestBody,
        ),
      );
      return data.languageCode ?? null;
    } catch (e) {
      this.logger.error('language detection failed', e.message);
      return null;
    }
  }

  async getLanguageIdOfText(text: string) {
    const languageCode = await this.detectLanguage(text);
    if (!languageCode) return null;
    const language = await this.languagesService.findOneByCode(languageCode);
    return language?.id || null;
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
