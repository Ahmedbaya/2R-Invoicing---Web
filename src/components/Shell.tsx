'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { logout } from '@/app/login/actions'
import { CategoriesIcon, ClientsIcon, DashboardIcon, InvoiceIcon, LogoutIcon, MenuIcon, ProductsIcon } from './icons'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { href: '/invoices', label: 'Invoices', Icon: InvoiceIcon },
  { href: '/clients', label: 'Clients', Icon: ClientsIcon },
  { href: '/products', label: 'Products', Icon: ProductsIcon },
  { href: '/categories', label: 'Categories', Icon: CategoriesIcon },
]

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <Image src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-lg bg-white" />
      <div>
        <div className="text-sm font-semibold leading-tight">2R Confection</div>
        <div className="text-xs text-white/60">Invoicing</div>
      </div>
    </div>
  )
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen md:flex">
      {/* Top bar on small screens */}
      <div className="flex items-center justify-between bg-ink px-4 py-3 text-white md:hidden">
        <Brand />
        <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="rounded p-2 hover:bg-white/10">
          <MenuIcon />
        </button>
      </div>

      <aside className={`${open ? 'flex' : 'hidden'} w-full flex-col bg-ink text-white md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0`}>
        <div className="hidden px-4 py-5 md:block"><Brand /></div>
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
        <form action={logout} className="p-3">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
            <LogoutIcon /> Sign out
          </button>
        </form>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}