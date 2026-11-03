import Link from 'next/link'
import { notFound } from 'next/navigation'
import { amountInWordsFr } from '@/lib/amountInWords'
import { computeTotals, formatNumber } from '@/lib/calc'
import { frDate, invoiceLabel } from '@/lib/format'
import { getInvoice } from '@/lib/queries'
import StatusBadge from '@/components/StatusBadge'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const inv = await getInvoice(Number(id))
  if (!inv) notFound()
  const t = computeTotals(inv.items)
  const c = inv.client
  const lg = inv.logistics

  return (
    <>
      <p className="mb-2 text-sm"><Link href="/invoices" className="text-blue-700 underline">← Invoices</Link></p>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Invoice {invoiceLabel(inv)}</h1>
          <StatusBadge status={inv.status} hasNumber={inv.number !== null} />
        </div>
        <div className="flex gap-2">
          <a href={`/api/invoices/${inv.id}/pdf`} className="rounded bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800">Download PDF</a>
          <a href={`/api/invoices/${inv.id}/excel`} className="rounded border bg-white px-3 py-1.5 text-sm hover:bg-slate-100">Download Excel</a>
        </div>
      </div>

      <section className="mb-4 grid gap-4 rounded border bg-white p-4 text-sm sm:grid-cols-2">
        <div>
          <div className="font-semibold">{c?.company_name ?? 'No client'}</div>
          {c?.address_1 && <div>{c.address_1}</div>}
          {c?.address_2 && <div>{c.address_2}</div>}
          {c?.country && <div>{c.country}</div>}
          {c?.tax_id && <div>{c.tax_id}</div>}
        </div>
        <div className="sm:text-right">
          <div>Date: {frDate(inv.issue_date)}</div>
          <div>Currency: {inv.currency}</div>
        </div>
      </section>

      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-2 text-right">Q.TE</th><th className="p-2">Code</th><th className="p-2">Commande</th>
              <th className="p-2">Articolo</th><th className="p-2">Code douane</th>
              <th className="p-2 text-right">Prix</th><th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, i) => (
              <tr key={it.id} className="border-t">
                <td className="p-2 text-right tabular-nums">{formatNumber(it.quantity)}</td>
                <td className="p-2">{it.item_code}</td>
                <td className="p-2">{it.order_name}</td>
                <td className="p-2">{it.description}</td>
                <td className="p-2">{it.customs_code}</td>
                <td className="p-2 text-right tabular-nums">{formatNumber(it.unit_price)}</td>
                <td className="p-2 text-right tabular-nums">{formatNumber(t.lines[i], 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-4 space-y-1 rounded border bg-white p-4 text-sm">
        <div className="flex justify-between"><span>Total quantity</span><b className="tabular-nums">{formatNumber(t.totalQuantity)}</b></div>
        <div className="flex justify-between text-base"><span>Total {inv.currency}</span><b className="tabular-nums">{formatNumber(t.totalAmount, 2)}</b></div>
        <p className="pt-1 font-medium">{amountInWordsFr(t.totalAmount)}</p>
        {inv.vat_note && <p>{inv.vat_note}</p>}
      </section>

      {(lg.customs_declaration || lg.transporter || lg.gross_weight_kg || lg.pallets !== null) && (
        <section className="mt-4 rounded border bg-white p-4 text-sm leading-6">
          <h2 className="mb-1 font-semibold">Shipping</h2>
          {lg.customs_declaration && <div>{lg.customs_declaration}</div>}
          {lg.transporter && <div>Transporter: {lg.transporter}</div>}
          {lg.gross_weight_kg && <div>Gross weight: {formatNumber(lg.gross_weight_kg)} kg{lg.net_weight_kg ? ` · Net weight: ${formatNumber(lg.net_weight_kg)} kg` : ''}</div>}
          {lg.pallets !== null && <div>Pallets: {lg.pallets}</div>}
        </section>
      )}
    </>
  )
}