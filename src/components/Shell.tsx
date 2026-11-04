'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { logout } from '@/app/login/actions'
import type { Lang } from '@/lib/i18n'
import { CategoriesIcon, ClientsIcon, DashboardIcon, InvoiceIcon, LogoutIcon, MenuIcon, ProductsIcon } from './icons'
import LangSwitcher from './LangSwitcher'

export interface ShellLabels {
  subtitle: string
  menu: string
  signOut: string
  dashboard: string
  invoices: string
  clients: string
  products: string
  categories: string
}

function Brand({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-lg bg-white" />
      <div>
        <div className="text-sm font-semibold leading-tight">2R Confection</div>
        <div className="text-xs text-white/60">{subtitle}</div>
      </div>
    </div>
  )
}

export default function Shell({ children, lang, labels }: { children: ReactNode; lang: Lang; labels: ShellLabels }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const NAV = [
    { href: '/dashboard', label: labels.dashboard, Icon: DashboardIcon },
    { href: '/invoices', label: labels.invoices, Icon: InvoiceIcon },
    { href: '/clients', label: labels.clients, Icon: ClientsIcon },
    { href: '/products', label: labels.products, Icon: ProductsIcon },
    { href: '/categories', label: labels.categories, Icon: CategoriesIcon },
  ]

  return (
    <div className="min-h-screen md:flex">
      <div className="flex items-center justify-between bg-ink px-4 py-3 text-white md:hidden">
        <Brand subtitle={labels.subtitle} />
        <button type="button" aria-label={labels.menu} aria-expanded={open} onClick={() => setOpen(!open)} className="rounded p-2 hover:bg-white/10">
          <MenuIcon />
        </button>
      </div>

      <aside className={`${open ? 'flex' : 'hidden'} w-full flex-col bg-ink text-white md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0`}>
        <div className="hidden px-4 py-5 md:block"><Brand subtitle={labels.subtitle} /></div>
        <nav className="flex-1 space-y-1 px-2 py-2" aria-label="Main">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${active ? 'bg-white/15 font-medium text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon /> {label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 pb-2"><LangSwitcher current={lang} dark /></div>
        <form action={logout} className="p-3">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
            <LogoutIcon /> {labels.signOut}
          </button>
        </form>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}