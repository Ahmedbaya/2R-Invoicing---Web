'use client'

import { useEffect, useState } from 'react'
import { isLang, translate, type Key, type Lang } from '@/lib/i18n'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const [lang, setLang] = useState<Lang>('fr')
  useEffect(() => {
    const l = document.documentElement.lang
    if (isLang(l)) setLang(l)
  }, [])
  const t = (key: Key) => translate(lang, key)

  return (
    <div role="alert" className="mx-auto mt-16 max-w-md rounded-lg border border-rule bg-white p-6 text-center">
      <h1 className="text-lg font-semibold">{t('err.title')}</h1>
      <p className="mt-2 text-sm text-ink/70">{t('err.text')}</p>
      <button onClick={reset} className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark">
        {t('err.retry')}
      </button>
    </div>
  )
}