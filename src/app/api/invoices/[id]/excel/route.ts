import { invoiceWorkbook } from '@/lib/excel'
import { fileBase } from '@/lib/format'
import { getInvoice } from '@/lib/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) return new Response('Not found', { status: 404 })
  const inv = await getInvoice(Number(id))
  if (!inv) return new Response('Not found', { status: 404 })
  const xlsx = await invoiceWorkbook(inv).xlsx.writeBuffer()
  return new Response(new Uint8Array(xlsx), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileBase(inv)}.xlsx"`,
    },
  })
}