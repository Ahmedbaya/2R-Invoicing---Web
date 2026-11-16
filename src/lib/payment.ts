import { frDate, todayIso } from './format'
import type { InvoiceRecord } from './types'

/** The payment lines printed on an invoice, as [label, value]. */
export function paymentLines(
  inv: Pick<InvoiceRecord, 'status' | 'payment_status' | 'payment_due_date' | 'paid_date'>,
): [string, string][] {
  const out: [string, string][] = []
  if (inv.payment_due_date) out.push(['ÉCHÉANCE', frDate(inv.payment_due_date)])
  if (inv.status === 'finalized') {
    const overdue = inv.payment_status === 'unpaid' && !!inv.payment_due_date && inv.payment_due_date < todayIso()
    out.push(['STATUT DU PAIEMENT', inv.payment_status === 'paid' ? 'Payée' : overdue ? 'En retard' : 'Impayée'])
    if (inv.payment_status === 'paid' && inv.paid_date) out.push(['DATE DE PAIEMENT', frDate(inv.paid_date)])
  }
  return out
}