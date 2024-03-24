import { TranslationBaseEntity } from '../entities/translation-base.entity';
import { Language } from '../../languages/entities/language.entity';

export interface ITranslation extends TranslationBaseEntity {
  language: Language;
}
