import Shell from '@/components/Shell'
import { getI18n } from '@/lib/i18n-server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, lang } = await getI18n()
  return (
    <Shell
      lang={lang}
      labels={{
        subtitle: t('app.subtitle'),
        menu: t('nav.menu'),
        signOut: t('nav.signOut'),
        dashboard: t('nav.dashboard'),
        invoices: t('nav.invoices'),
        clients: t('nav.clients'),
        products: t('nav.products'),
        categories: t('nav.categories'),
      }}
    >
      {children}
    </Shell>
  )
}