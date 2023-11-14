import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Translation } from './entities/translation.entity';
import { Repository } from 'typeorm';
import { Language } from '../languages/entities/language.entity';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { v2 } from '@google-cloud/translate';
import { ConfigService } from '@nestjs/config';
import { IGoogleCloudConfig } from '../config/configuration';
import { LanguagesService } from '../languages/languages.service';

@Injectable()
export class TranslationsService {
  private readonly logger = new Logger('Translation service');

  constructor(
    @InjectRepository(Translation)
    private translationsRepository: Repository<Translation>,
    @InjectRepository(Language)
    private languagesRepository: Repository<Language>,
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

  // get last max textId
  async getMaxTextId(): Promise<number> {
    const result = await this.translationsRepository
      .createQueryBuilder('t')
      .select('MAX(textId)', 'max')
      .distinct()
      .getRawOne<{ max: number }>();
    return result?.max ? result.max + 1 : 1;
  }

  // create new translation by lang id
  async createTranslation(
    langId: number,
    text: string,
    original = false,
    textId?: number,
  ): Promise<Translation> {
    const language = await this.languagesRepository.findOne({
      where: {
        id: langId,
      },
    });
    if (!language) throw new BadRequestException('Invalid language id');
    if (!textId) textId = await this.getMaxTextId();
    const textTranslation = await this.translationsRepository.create({
      text: text,
      textId: textId,
      language: language,
      original: original,
    });
    return await this.translationsRepository.save(textTranslation);
  }

  // translate by google
  private async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string,
  ): Promise<string> {
    try {
      const [translation] = await this.translateClient.translate(text, {
        from: sourceLanguage,
        to: targetLanguage,
      });

      return translation;
    } catch (e) {
      this.logger.error('Translation failed', e.message);
      return text;
    }
  }

  async translateAll(text: string, textId: number, originalLangId: number) {
    const originalLanguage = await this.languagesService.findOne(
      originalLangId,
    );
    const languages = await this.languagesRepository
      .createQueryBuilder('lang')
      .where('lang.id <> :originalLangId', { originalLangId })
      .getMany();

    await Promise.allSettled(
      languages.map(async (lang) => {
        const translatedText = await this.translate(
          text,
          lang.code,
          originalLanguage.code,
        );
        const translation = new Translation();
        translation.text = translatedText;
        translation.textId = textId;
        translation.language = lang;
        translation.original = false;
        await this.translationsRepository.save(translation);
      }),
    );
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

  // update translation
  async update(id: number, updateTranslationDto: UpdateTranslationDto) {
    const result = await this.translationsRepository.update(id, {
      language: {
        id: updateTranslationDto.langId,
      },
      text: updateTranslationDto.text,
      textId: updateTranslationDto.textId,
      original: updateTranslationDto.original,
    });
    if (!result.affected)
      throw new BadRequestException({ message: 'translation was not found' });
    return { id: id };
  }

  // update translation
  async updateByTextIdAndLangId(
    textId: number,
    updateTranslationDto: UpdateTranslationDto,
  ) {
    const translation = await this.translationsRepository.findOne({
      select: { id: true },
      where: {
        textId: textId,
        language: {
          id: updateTranslationDto.langId,
        },
      },
    });
    if (!translation)
      throw new BadRequestException({ message: 'translation was not found' });
    const result = await this.translationsRepository.update(translation.id, {
      text: updateTranslationDto.text,
      original: updateTranslationDto.original,
    });
    if (!result.affected)
      throw new BadRequestException({ message: 'translation was not found' });
    return;
  }
}
