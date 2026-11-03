import Link from 'next/link'
import { dec, formatNumber } from '@/lib/calc'
import { frDate, invoiceLabel } from '@/lib/format'
import { listClients, listInvoices, listYears } from '@/lib/queries'
import StatusBadge from '@/components/StatusBadge'

type SP = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const filters = { q: one(sp.q), year: one(sp.year), client: one(sp.client), status: one(sp.status) }
  const [rows, years, clients] = await Promise.all([listInvoices(filters), listYears(), listClients()])

  const byCurrency: Record<string, string> = {}
  for (const r of rows) byCurrency[r.currency] = dec(byCurrency[r.currency] ?? '0').plus(r.total_amount).toFixed(2)

  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString()
  const hasFilters = qs !== ''

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <a href={`/api/invoices/export?${qs}`} className="rounded border bg-white px-3 py-1.5 text-sm hover:bg-slate-100">
          Export list to Excel
        </a>
      </div>

      <form method="get" className="mb-4 flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={filters.q} placeholder="Search number, client, article, order, date…" className="min-w-64 flex-1 rounded border bg-white px-3 py-1.5 text-sm" />
        <select name="status" defaultValue={filters.status ?? ''} className="rounded border bg-white px-2 py-1.5 text-sm">
          <option value="">All statuses</option>
          <option value="finalized">Finalized</option>
          <option value="draft">Draft</option>
        </select>
        <select name="year" defaultValue={filters.year ?? ''} className="rounded border bg-white px-2 py-1.5 text-sm">
          <option value="">All years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select name="client" defaultValue={filters.client ?? ''} className="max-w-56 rounded border bg-white px-2 py-1.5 text-sm">
          <option value="">All clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </select>
        <button className="rounded bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800">Filter</button>
        {hasFilters && <Link href="/invoices" className="text-sm underline">Clear</Link>}
      </form>

      {rows.length === 0 ? (
        <p className="text-sm">No invoice matches.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="p-2">Number</th><th className="p-2">Client</th><th className="p-2">Date</th>
                  <th className="p-2 text-right">Total</th><th className="p-2">Status</th><th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-slate-50">
                    <td className="p-2"><Link className="text-blue-700 underline" href={`/invoices/${r.id}`}>{invoiceLabel(r)}</Link></td>
                    <td className="p-2">{r.client_name ?? 'No client'}</td>
                    <td className="p-2">{frDate(r.issue_date)}</td>
                    <td className="p-2 text-right tabular-nums">{formatNumber(r.total_amount, 2)} {r.currency}</td>
                    <td className="p-2"><StatusBadge status={r.status} hasNumber={r.number !== null} /></td>
                    <td className="space-x-3 p-2 text-right whitespace-nowrap">
                      <a className="text-blue-700 underline" href={`/api/invoices/${r.id}/pdf`}>PDF</a>
                      <a className="text-blue-700 underline" href={`/api/invoices/${r.id}/excel`}>Excel</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-slate-600">{rows.length} invoice{rows.length === 1 ? '' : 's'}{rows.length === 500 ? ' (first 500 shown)' : ''}</span>
            <span className="font-medium tabular-nums">
              Total shown: {Object.entries(byCurrency).map(([cur, v]) => `${formatNumber(v, 2)} ${cur}`).join('  ·  ')}
            </span>
          </div>
        </>
      )}
    </>
  )
}