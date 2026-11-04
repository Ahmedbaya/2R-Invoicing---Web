import Link from 'next/link'
import { notFound } from 'next/navigation'
import { amountInWordsFr } from '@/lib/amountInWords'
import { computeTotals, formatNumber } from '@/lib/calc'
import { frDate, invoiceLabel } from '@/lib/format'
import { getI18n } from '@/lib/i18n-server'
import { getInvoice } from '@/lib/queries'
import StatusBadge from '@/components/StatusBadge'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getI18n()
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const inv = await getInvoice(Number(id))
  if (!inv) notFound()
  const totals = computeTotals(inv.items)
  const c = inv.client
  const lg = inv.logistics

  return (
    <>
      <p className="mb-2 text-sm"><Link href="/invoices" className="text-accent underline">{t('det.back')}</Link></p>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{t('det.title', { number: invoiceLabel(inv, t('status.draft')) })}</h1>
          <StatusBadge status={inv.status} hasNumber={inv.number !== null} />
        </div>
        <div className="flex gap-2">
          <a href={`/api/invoices/${inv.id}/pdf`} className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-dark">{t('det.downloadPdf')}</a>
          <a href={`/api/invoices/${inv.id}/excel`} className="rounded border border-rule bg-white px-3 py-1.5 text-sm hover:bg-mist">{t('det.downloadExcel')}</a>
        </div>
      </div>

      <section className="mb-4 grid gap-4 rounded border border-rule bg-white p-4 text-sm sm:grid-cols-2">
        <div>
          <div className="font-semibold">{c?.company_name ?? t('common.noClient')}</div>
          {c?.address_1 && <div>{c.address_1}</div>}
          {c?.address_2 && <div>{c.address_2}</div>}
          {c?.country && <div>{c.country}</div>}
          {c?.tax_id && <div>{c.tax_id}</div>}
        </div>
        <div className="sm:text-right">
          <div>{t('det.date')}: {frDate(inv.issue_date)}</div>
          <div>{t('det.currency')}: {inv.currency}</div>
        </div>
      </section>

      <div className="overflow-x-auto rounded border border-rule bg-white">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left">
            <tr>
              <th className="p-2 text-right">{t('det.qty')}</th><th className="p-2">{t('det.code')}</th><th className="p-2">{t('det.order')}</th>
              <th className="p-2">{t('det.article')}</th><th className="p-2">{t('det.customs')}</th>
              <th className="p-2 text-right">{t('det.price')}</th><th className="p-2 text-right">{t('det.total')}</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, i) => (
              <tr key={it.id} className="border-t border-rule">
                <td className="p-2 text-right tabular-nums">{formatNumber(it.quantity)}</td>
                <td className="p-2">{it.item_code}</td>
                <td className="p-2">{it.order_name}</td>
                <td className="p-2">{it.description}</td>
                <td className="p-2">{it.customs_code}</td>
                <td className="p-2 text-right tabular-nums">{formatNumber(it.unit_price)}</td>
                <td className="p-2 text-right tabular-nums">{formatNumber(totals.lines[i], 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-4 space-y-1 rounded border border-rule bg-white p-4 text-sm">
        <div className="flex justify-between"><span>{t('det.totalQty')}</span><b className="tabular-nums">{formatNumber(totals.totalQuantity)}</b></div>
        <div className="flex justify-between text-base"><span>{t('det.totalAmount', { currency: inv.currency })}</span><b className="tabular-nums">{formatNumber(totals.totalAmount, 2)}</b></div>
        <p className="pt-1 font-medium">{amountInWordsFr(totals.totalAmount)}</p>
        {inv.vat_note && <p>{inv.vat_note}</p>}
      </section>

      {(lg.customs_declaration || lg.transporter || lg.gross_weight_kg || lg.pallets !== null) && (
        <section className="mt-4 rounded border border-rule bg-white p-4 text-sm leading-6">
          <h2 className="mb-1 font-semibold">{t('det.shipping')}</h2>
          {lg.customs_declaration && <div>{lg.customs_declaration}</div>}
          {lg.transporter && <div>{t('det.transporter')}: {lg.transporter}</div>}
          {lg.gross_weight_kg && (
            <div>
              {t('det.gross')}: {formatNumber(lg.gross_weight_kg)} {t('det.kg')}
              {lg.net_weight_kg ? ` · ${t('det.net')}: ${formatNumber(lg.net_weight_kg)} ${t('det.kg')}` : ''}
            </div>
          )}
          {lg.pallets !== null && <div>{t('det.pallets')}: {lg.pallets}</div>}
        </section>
      )}
    </>
  )
}