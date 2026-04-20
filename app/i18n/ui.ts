import spanishKeys from './locales/es.json';
import englishKeys from './locales/en.json';

export const languages = {
  en: 'English',
  es: 'Español',
} as const;

export const defaultLang: Lang = (import.meta.env.APP_LOCALE as Lang) || 'es';

export type Lang = keyof typeof languages;

export const ui = {
  en: englishKeys,
  es: spanishKeys,
} as const;
