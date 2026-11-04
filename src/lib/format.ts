import type { InvoiceRecord } from './types'

export const frDate = (iso: string) => iso.split('-').reverse().join('/')

export const invoiceLabel = (i: { number: number | null; year: number | null }, draft = 'Draft') =>
  i.number ? `${i.number} / ${i.year}` : draft
export const fileBase = (i: Pick<InvoiceRecord, 'id' | 'number' | 'year'>) =>
  i.number ? `FACTURE_${i.number}-${i.year}` : `BROUILLON_${i.id}`