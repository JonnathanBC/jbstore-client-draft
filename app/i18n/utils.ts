import { ui, defaultLang, type Lang } from './ui'

export { type Lang }

const translations = ui as Record<string, Record<string, unknown>>
const DEFAULT_LANG = defaultLang

function getNestedValue(
  obj: Record<string, unknown> | unknown,
  keys: string[],
): unknown {
  let result: unknown = obj
  for (const k of keys) {
    if (result != null && typeof result === 'object') {
      result = (result as Record<string, unknown>)[k]
    } else {
      return undefined
    }
  }
  return result
}

export function t(key: string, lang?: Lang): string {
  const targetLang: Lang = lang ?? DEFAULT_LANG
  const keys = key.split('.')
  const value = getNestedValue(translations[targetLang], keys)

  if (typeof value === 'string') return value

  const fallback = getNestedValue(translations[DEFAULT_LANG], keys)
  return typeof fallback === 'string' ? fallback : key
}

