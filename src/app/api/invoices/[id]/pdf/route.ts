import { renderToBuffer } from '@react-pdf/renderer'
import { fileBase } from '@/lib/format'
import { invoiceDocument } from '@/lib/invoicePdf'
import { getInvoice } from '@/lib/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) return new Response('Not found', { status: 404 })
  const inv = await getInvoice(Number(id))
  if (!inv) return new Response('Not found', { status: 404 })
  const pdf = await renderToBuffer(invoiceDocument(inv))
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileBase(inv)}.pdf"`,
    },
  })
}