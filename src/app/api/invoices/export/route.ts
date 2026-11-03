import { listWorkbook } from '@/lib/excel'
import { listInvoices } from '@/lib/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  const rows = await listInvoices(
    { q: sp.get('q') ?? undefined, year: sp.get('year') ?? undefined, client: sp.get('client') ?? undefined, status: sp.get('status') ?? undefined },
    5000,
  )
  if (rows.length === 0) return new Response('No invoices to export', { status: 404 })
  const xlsx = await listWorkbook(rows).xlsx.writeBuffer()
  return new Response(new Uint8Array(xlsx), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Liste_factures_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}