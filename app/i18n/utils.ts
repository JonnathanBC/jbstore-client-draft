import { ui, defaultLang, type Lang } from './ui';

export { defaultLang, type Lang } from './ui';

const translations = ui as Record<string, Record<string, unknown>>;

function getNestedValue(obj: Record<string, unknown> | unknown, keys: string[]): unknown {
  let result: unknown = obj;
  for (const k of keys) {
    if (result != null && typeof result === 'object') {
      result = (result as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return result;
}

export function t(key: string, lang?: Lang): string {
  const targetLang = lang ?? defaultLang;
  const keys = key.split('.');
  const value = getNestedValue(translations[targetLang], keys);

  if (typeof value === 'string') return value;

  const fallback = getNestedValue(translations[defaultLang], keys);
  return typeof fallback === 'string' ? fallback : key;
}

export const currentLang = defaultLang;
