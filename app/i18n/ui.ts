import spanishKeys from './locales/es.json'
import englishKeys from './locales/en.json'

export type Lang = 'en' | 'es'

export const ui = {
  en: englishKeys,
  es: spanishKeys,
} as const

const defaultLang: Lang = 'es'

export { defaultLang }