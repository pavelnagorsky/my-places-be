import { TranslationBaseEntity } from "../entities/translation-base.entity";
import { Language } from "../../../languages/entities/language.entity";

export interface ITranslation extends TranslationBaseEntity {
  language: Language;
}

export interface IYandexTranslateRequest {
  sourceLanguageCode?: string;
  targetLanguageCode: string;
  // Default to PLAIN_TEXT
  format?: "PLAIN_TEXT" | "HTML";
  // one filed is limited to 10000 symbols
  texts: string[];
  // wordings check & correction
  speller?: boolean;
}

export interface IYandexTranslateResponse {
  translations: IYandexTranslateResponseTranslationItem[];
}

interface IYandexTranslateResponseTranslationItem {
  // max 1000 symbols
  text: string;
  detectedLanguageCode: string;
}

export const languageCodeHints = ["ru", "be", "en"];

export interface IYandexDetectLanguageRequest {
  text: string;
  languageCodeHints: typeof languageCodeHints;
}

export interface IYandexDetectLanguageResponse {
  languageCode: string;
}
