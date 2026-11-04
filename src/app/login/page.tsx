import LangSwitcher from '@/components/LangSwitcher'
import { getI18n } from '@/lib/i18n-server'
import { login } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const { t, lang } = await getI18n()
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-lg border border-rule bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-lg" />
            <div>
              <h1 className="text-lg font-semibold leading-tight">2R Confection</h1>
              <p className="text-sm text-ink/70">{t('app.subtitle')}</p>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">{t('login.password')}</label>
          <input id="password" name="password" type="password" required autoFocus className="w-full rounded border border-rule px-3 py-2" />
        </div>
        {error && <p role="alert" className="text-sm text-danger">{t('login.wrong')}</p>}
        <button className="w-full rounded bg-accent px-3 py-2 font-medium text-white hover:bg-accent-dark">{t('login.signIn')}</button>
      </form>
      <div className="fixed right-4 top-4"><LangSwitcher current={lang} /></div>
    </main>
  )
}