import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatNumber } from '@/lib/calc'
import { frDate, invoiceLabel } from '@/lib/format'
import { getDashboardStats } from '@/lib/queries'
import BarChart from '@/components/BarChart'
import StatusBadge from '@/components/StatusBadge'

const eur = (v: string) => `${formatNumber(v, 2)} €`

function Card({ label, value, hint, href, warn }: { label: string; value: string; hint?: ReactNode; href?: string; warn?: boolean }) {
  const body = (
    <>
      <div className="text-sm text-ink/70">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink/70">{hint}</div>}
    </>
  )
  const cls = `block rounded-lg border p-4 ${warn ? 'border-amber-300 bg-amber-50' : 'border-rule bg-white'}`
  return href ? <Link href={href} className={`${cls} hover:shadow-sm`}>{body}</Link> : <div className={cls}>{body}</div>
}

function Panel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-rule bg-white p-4 ${className}`}>
      <h2 className="mb-3 font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function trend(cur: string, prev: string) {
  const c = Number(cur)
  const p = Number(prev)
  if (!p) return <span>No finalized invoices last month</span>
  const pct = ((c - p) / p) * 100
  return (
    <span className={pct >= 0 ? 'text-emerald-700' : 'text-danger'}>
      {pct >= 0 ? '▲' : '▼'} {Math.abs(pct).toFixed(0)} % vs last month
    </span>
  )
}

export default async function DashboardPage() {
  const s = await getDashboardStats()
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const yearTotal = Number(s.revenue_year)
  const maxCat = Math.max(...s.by_category.map((c) => Number(c.total)), 1)

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-ink/70">{today}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/invoices/export?year=${s.year}&status=finalized`} className="rounded border border-rule bg-white px-3 py-1.5 text-sm hover:bg-mist">
            Export {s.year} to Excel
          </a>
          <Link href="/invoices" className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-dark">All invoices</Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card label="Revenue this month" value={eur(s.revenue_month)} hint={trend(s.revenue_month, s.revenue_prev_month)} />
          <Card label={`Revenue ${s.year}`} value={eur(s.revenue_year)} hint={`${s.invoices_year} finalized invoices`} />
          <Card label="Invoices this month" value={String(s.invoices_month)} hint="Finalized" href={`/invoices?status=finalized&year=${s.year}`} />
          <Card
            label="Drafts waiting"
            value={String(s.drafts)}
            hint={s.drafts > 0 ? 'Finish them in the desktop app' : 'Nothing pending'}
            href="/invoices?status=draft"
            warn={s.drafts > 0}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title={`Monthly revenue ${s.year}`} className="lg:col-span-2">
            {yearTotal === 0
              ? <p className="text-sm text-ink/70">No finalized invoices yet this year.</p>
              : <BarChart values={s.monthly.map(Number)} currentMonth={new Date().getMonth()} />}
          </Panel>
          <Panel title="Revenue by customs category">
            {s.by_category.length === 0 ? <p className="text-sm text-ink/70">Nothing to show yet.</p> : (
              <ul className="space-y-3 text-sm">
                {s.by_category.map((c) => {
                  const total = Number(c.total)
                  return (
                    <li key={c.customs_code}>
                      <div className="flex justify-between gap-2">
                        <Link href={`/products?customs=${encodeURIComponent(c.customs_code)}`} className="hover:underline">
                          {c.customs_code || 'No customs code'}{c.name ? ` · ${c.name}` : ''}
                        </Link>
                        <span className="tabular-nums">{yearTotal ? ((total / yearTotal) * 100).toFixed(0) : 0} %</span>
                      </div>
                      <div className="mt-1 h-2 rounded bg-accent/10"><div className="h-2 rounded bg-accent" style={{ width: `${(total / maxCat) * 100}%` }} /></div>
                      <div className="mt-0.5 text-xs tabular-nums text-ink/70">{eur(c.total)}</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title={`Top clients ${s.year}`}>
            {s.top_clients.length === 0 ? <p className="text-sm text-ink/70">Nothing to show yet.</p> : (
              <ol className="space-y-2 text-sm">
                {s.top_clients.map((c, i) => (
                  <li key={`${c.client_id}-${c.name}`} className="flex items-center justify-between gap-2">
                    <span>
                      <span className="mr-2 text-ink/50">{i + 1}.</span>
                      {c.client_id ? <Link className="hover:underline" href={`/invoices?client=${c.client_id}&year=${s.year}`}>{c.name}</Link> : c.name}
                      <span className="ml-1 text-xs text-ink/60">({c.count})</span>
                    </span>
                    <span className="tabular-nums">{eur(c.total)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
          <Panel title="Latest invoices" className="lg:col-span-2">
            {s.recent.length === 0 ? <p className="text-sm">No invoices yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-ink/70">
                    <tr><th className="pb-1">Number</th><th className="pb-1">Client</th><th className="pb-1">Date</th><th className="pb-1 text-right">Total</th><th className="pb-1 pl-3">Status</th></tr>
                  </thead>
                  <tbody>
                    {s.recent.map((r) => (
                      <tr key={r.id} className="border-t border-rule">
                        <td className="py-1.5"><Link className="text-accent underline" href={`/invoices/${r.id}`}>{invoiceLabel(r)}</Link></td>
                        <td className="py-1.5">{r.client_name ?? 'No client'}</td>
                        <td className="py-1.5">{frDate(r.issue_date)}</td>
                        <td className="py-1.5 text-right tabular-nums">{formatNumber(r.total_amount, 2)} {r.currency}</td>
                        <td className="py-1.5 pl-3"><StatusBadge status={r.status} hasNumber={r.number !== null} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}