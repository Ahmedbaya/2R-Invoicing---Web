import { frDate, todayIso } from '@/lib/format'
import { getI18n } from '@/lib/i18n-server'

export default async function PaymentBadge({ finalized, status, due, paid }: {
  finalized: boolean
  status: 'unpaid' | 'paid'
  due: string | null
  paid: string | null
}) {
  const { t } = await getI18n()
  if (!finalized) return <span className="text-ink/40">-</span>

  let label: string
  let cls: string
  if (status === 'paid') {
    label = t('pay.paidOn', { date: paid ? frDate(paid) : '' })
    cls = 'bg-emerald-50 text-emerald-800 ring-emerald-200'
  } else if (due && due < todayIso()) {
    label = t('pay.overdueSince', { date: frDate(due) })
    cls = 'bg-red-50 text-red-800 ring-red-200'
  } else {
    label = due ? t('pay.unpaidDue', { date: frDate(due) }) : t('pay.unpaid')
    cls = 'bg-slate-100 text-slate-700 ring-slate-200'
  }
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>{label}</span>
}