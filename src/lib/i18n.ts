import { en, type Key } from '@/locales/en'
import { fr } from '@/locales/fr'
import { it } from '@/locales/it'

export type { Key }
export type Lang = 'en' | 'fr' | 'it'
export type Vars = Record<string, string | number>

export const LANGS: { code: Lang; short: string; label: string }[] = [
  { code: 'fr', short: 'FR', label: 'Français' },
  { code: 'it', short: 'IT', label: 'Italiano' },
  { code: 'en', short: 'EN', label: 'English' },
]
export const LOCALES: Record<Lang, string> = { en: 'en-GB', fr: 'fr-FR', it: 'it-IT' }
export const isLang = (v: unknown): v is Lang => v === 'en' || v === 'fr' || v === 'it'

const DICTS: Record<Lang, Record<Key, string>> = { en, fr, it }

export function translate(lang: Lang, key: Key, vars?: Vars): string {
  let s = DICTS[lang][key] ?? en[key]
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
  return s
}