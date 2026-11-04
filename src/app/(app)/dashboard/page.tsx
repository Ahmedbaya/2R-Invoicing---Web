import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatNumber } from '@/lib/calc'
import { frDate, invoiceLabel } from '@/lib/format'
import { getI18n } from '@/lib/i18n-server'
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

export default async function DashboardPage() {
  const { t, locale } = await getI18n()
  const s = await getDashboardStats()
  const today = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const months = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(locale, { month: 'short' }))
  const yearTotal = Number(s.revenue_year)
  const maxCat = Math.max(...s.by_category.map((c) => Number(c.total)), 1)

  const trend = (cur: string, prev: string) => {
    const c = Number(cur)
    const p = Number(prev)
    if (!p) return <span>{t('dash.trendNone')}</span>
    const pct = ((c - p) / p) * 100
    return (
      <span className={pct >= 0 ? 'text-emerald-700' : 'text-danger'}>
        {pct >= 0 ? '▲' : '▼'} {t('dash.trendVs', { pct: Math.abs(pct).toFixed(0) })}
      </span>
    )
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('dash.title')}</h1>
          <p className="text-sm text-ink/70">{today}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/invoices/export?year=${s.year}&status=finalized`} className="rounded border border-rule bg-white px-3 py-1.5 text-sm hover:bg-mist">
            {t('dash.exportYear', { year: s.year })}
          </a>
          <Link href="/invoices" className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-dark">{t('dash.allInvoices')}</Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card label={t('dash.revenueMonth')} value={eur(s.revenue_month)} hint={trend(s.revenue_month, s.revenue_prev_month)} />
          <Card label={t('dash.revenueYear', { year: s.year })} value={eur(s.revenue_year)} hint={t('dash.finalizedCount', { n: s.invoices_year })} />
          <Card label={t('dash.invoicesMonth')} value={String(s.invoices_month)} hint={t('dash.finalizedHint')} href={`/invoices?status=finalized&year=${s.year}`} />
          <Card
            label={t('dash.drafts')}
            value={String(s.drafts)}
            hint={s.drafts > 0 ? t('dash.draftsHint') : t('dash.nothingPending')}
            href="/invoices?status=draft"
            warn={s.drafts > 0}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title={t('dash.monthly', { year: s.year })} className="lg:col-span-2">
            {yearTotal === 0
              ? <p className="text-sm text-ink/70">{t('dash.noFinalized')}</p>
              : <BarChart values={s.monthly.map(Number)} months={months} currentMonth={new Date().getMonth()} label={t('dash.chartLabel')} />}
          </Panel>
          <Panel title={t('dash.byCategory')}>
            {s.by_category.length === 0 ? <p className="text-sm text-ink/70">{t('dash.nothingYet')}</p> : (
              <ul className="space-y-3 text-sm">
                {s.by_category.map((c) => {
                  const total = Number(c.total)
                  return (
                    <li key={c.customs_code}>
                      <div className="flex justify-between gap-2">
                        <Link href={`/products?customs=${encodeURIComponent(c.customs_code)}`} className="hover:underline">
                          {c.customs_code || t('dash.noCustoms')}{c.name ? ` · ${c.name}` : ''}
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
          <Panel title={t('dash.topClients', { year: s.year })}>
            {s.top_clients.length === 0 ? <p className="text-sm text-ink/70">{t('dash.nothingYet')}</p> : (
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
          <Panel title={t('dash.latest')} className="lg:col-span-2">
            {s.recent.length === 0 ? <p className="text-sm">{t('dash.noInvoices')}</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-ink/70">
                    <tr>
                      <th className="pb-1">{t('col.number')}</th><th className="pb-1">{t('col.client')}</th><th className="pb-1">{t('col.date')}</th>
                      <th className="pb-1 text-right">{t('col.total')}</th><th className="pb-1 pl-3">{t('col.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.recent.map((r) => (
                      <tr key={r.id} className="border-t border-rule">
                        <td className="py-1.5"><Link className="text-accent underline" href={`/invoices/${r.id}`}>{invoiceLabel(r, t('status.draft'))}</Link></td>
                        <td className="py-1.5">{r.client_name ?? t('common.noClient')}</td>
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