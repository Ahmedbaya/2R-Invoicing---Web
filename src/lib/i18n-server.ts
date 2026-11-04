import { cookies, headers } from 'next/headers'
import { isLang, LOCALES, translate, type Key, type Lang, type Vars } from './i18n'

/** The cookie wins. Otherwise the browser's language, otherwise French. */
export async function getLang(): Promise<Lang> {
  const saved = (await cookies()).get('lang')?.value
  if (isLang(saved)) return saved
  const first = ((await headers()).get('accept-language') ?? '').split(',')[0]?.trim().slice(0, 2).toLowerCase()
  return isLang(first) ? first : 'fr'
}

export async function getI18n() {
  const lang = await getLang()
  return { lang, locale: LOCALES[lang], t: (key: Key, vars?: Vars) => translate(lang, key, vars) }
}