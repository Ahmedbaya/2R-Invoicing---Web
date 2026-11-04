'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { isLang } from './i18n'

export async function setLang(formData: FormData) {
  const lang = formData.get('lang')
  if (!isLang(lang)) return
  const jar = await cookies()
  jar.set('lang', lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  revalidatePath('/', 'layout')
}