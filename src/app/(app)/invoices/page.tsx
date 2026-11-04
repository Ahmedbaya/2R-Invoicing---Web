import Link from 'next/link'
import { dec, formatNumber } from '@/lib/calc'
import { frDate, invoiceLabel } from '@/lib/format'
import { getI18n } from '@/lib/i18n-server'
import { listClients, listInvoices, listYears } from '@/lib/queries'
import StatusBadge from '@/components/StatusBadge'

type SP = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const { t } = await getI18n()
  const sp = await searchParams
  const filters = { q: one(sp.q), year: one(sp.year), client: one(sp.client), status: one(sp.status) }
  const [rows, years, clients] = await Promise.all([listInvoices(filters), listYears(), listClients()])

  const byCurrency: Record<string, string> = {}
  for (const r of rows) byCurrency[r.currency] = dec(byCurrency[r.currency] ?? '0').plus(r.total_amount).toFixed(2)

  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString()
  const hasFilters = qs !== ''

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{t('inv.title')}</h1>
        <a href={`/api/invoices/export?${qs}`} className="rounded border border-rule bg-white px-3 py-1.5 text-sm hover:bg-mist">
          {t('inv.exportList')}
        </a>
      </div>

      <form method="get" className="mb-4 flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={filters.q} placeholder={t('inv.search')} className="min-w-64 flex-1 rounded border border-rule bg-white px-3 py-1.5 text-sm" />
        <select name="status" defaultValue={filters.status ?? ''} className="rounded border border-rule bg-white px-2 py-1.5 text-sm">
          <option value="">{t('inv.allStatuses')}</option>
          <option value="finalized">{t('status.finalized')}</option>
          <option value="draft">{t('status.draft')}</option>
        </select>
        <select name="year" defaultValue={filters.year ?? ''} className="rounded border border-rule bg-white px-2 py-1.5 text-sm">
          <option value="">{t('inv.allYears')}</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select name="client" defaultValue={filters.client ?? ''} className="max-w-56 rounded border border-rule bg-white px-2 py-1.5 text-sm">
          <option value="">{t('inv.allClients')}</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </select>
        <button className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-dark">{t('inv.filter')}</button>
        {hasFilters && <Link href="/invoices" className="text-sm underline">{t('inv.clear')}</Link>}
      </form>

      {rows.length === 0 ? (
        <p className="text-sm">{t('inv.noMatch')}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded border border-rule bg-white">
            <table className="w-full text-sm">
              <thead className="bg-mist text-left">
                <tr>
                  <th className="p-2">{t('col.number')}</th><th className="p-2">{t('col.client')}</th><th className="p-2">{t('col.date')}</th>
                  <th className="p-2 text-right">{t('col.total')}</th><th className="p-2">{t('col.status')}</th><th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-rule hover:bg-mist/60">
                    <td className="p-2"><Link className="text-accent underline" href={`/invoices/${r.id}`}>{invoiceLabel(r, t('status.draft'))}</Link></td>
                    <td className="p-2">{r.client_name ?? t('common.noClient')}</td>
                    <td className="p-2">{frDate(r.issue_date)}</td>
                    <td className="p-2 text-right tabular-nums">{formatNumber(r.total_amount, 2)} {r.currency}</td>
                    <td className="p-2"><StatusBadge status={r.status} hasNumber={r.number !== null} /></td>
                    <td className="space-x-3 p-2 text-right whitespace-nowrap">
                      <a className="text-accent underline" href={`/api/invoices/${r.id}/pdf`}>{t('inv.pdf')}</a>
                      <a className="text-accent underline" href={`/api/invoices/${r.id}/excel`}>{t('inv.excel')}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-ink/70">
              {rows.length === 1 ? t('inv.countOne') : t('inv.countMany', { n: rows.length })}
              {rows.length === 500 ? ` ${t('inv.capped')}` : ''}
            </span>
            <span className="font-medium tabular-nums">
              {t('inv.shown')}: {Object.entries(byCurrency).map(([cur, v]) => `${formatNumber(v, 2)} ${cur}`).join('  ·  ')}
            </span>
          </div>
        </>
      )}
    </>
  )
}