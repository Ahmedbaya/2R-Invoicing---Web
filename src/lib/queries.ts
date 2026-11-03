import { dec } from './calc'
import { requireAuth } from './auth'
import { pool } from './db'
import type { Category, Client, DashboardStats, InvoiceListRow, InvoiceRecord, Product } from './types'

const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&')

export interface InvoiceFilters { q?: string; year?: string; client?: string; status?: string }

export async function listInvoices(f: InvoiceFilters, limit = 500): Promise<InvoiceListRow[]> {
  await requireAuth()
  const q = f.q?.trim() ? `%${escapeLike(f.q.trim())}%` : null
  const year = /^\d{4}$/.test(f.year ?? '') ? Number(f.year) : null
  const client = /^\d+$/.test(f.client ?? '') ? Number(f.client) : null
  const status = f.status === 'draft' || f.status === 'finalized' ? f.status : null
  const { rows } = await pool.query(
    `SELECT i.id, i.status, i.number, i.year, i.issue_date, i.currency, i.total_amount, i.total_quantity,
            COALESCE(i.client_snapshot->>'company_name', c.company_name) AS client_name
       FROM invoices i LEFT JOIN clients c ON c.id = i.client_id
      WHERE ($1::int IS NULL OR EXTRACT(YEAR FROM i.issue_date)::int = $1::int)
        AND ($2::int IS NULL OR i.client_id = $2::int)
        AND ($3::text IS NULL OR i.status = $3::text)
        AND ($4::text IS NULL
             OR concat(i.number, '/', i.year) ILIKE $4::text
             OR COALESCE(i.client_snapshot->>'company_name', c.company_name, '') ILIKE $4::text
             OR to_char(i.issue_date, 'DD/MM/YYYY') ILIKE $4::text
             OR EXISTS (SELECT 1 FROM invoice_items ii
                         WHERE ii.invoice_id = i.id
                           AND concat_ws(' ', ii.item_code, ii.order_name, ii.description) ILIKE $4::text))
      ORDER BY i.issue_date DESC, i.id DESC
      LIMIT ${Number(limit)}`,
    [year, client, status, q],
  )
  return rows
}

export async function listYears(): Promise<number[]> {
  await requireAuth()
  const { rows } = await pool.query('SELECT DISTINCT EXTRACT(YEAR FROM issue_date)::int AS y FROM invoices ORDER BY y DESC')
  return rows.map((r) => r.y as number)
}

export async function listClients(): Promise<Client[]> {
  await requireAuth()
  const { rows } = await pool.query('SELECT id, company_name, address_1, address_2, country, tax_id FROM clients ORDER BY company_name')
  return rows
}

export async function listCategories(): Promise<Category[]> {
  await requireAuth()
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.customs_code, (SELECT count(*) FROM products p WHERE p.category_id = c.id)::int AS products
       FROM categories c ORDER BY c.name`,
  )
  return rows
}

export async function listProducts(customs?: string): Promise<Product[]> {
  await requireAuth()
  const filter = customs && customs.length <= 20 ? customs : null
  const { rows } = await pool.query(
    `SELECT p.id, p.code, p.name, p.description, p.default_price, c.name AS category_name, c.customs_code
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
      WHERE ($1::text IS NULL OR ($1::text = '__none__' AND c.customs_code IS NULL) OR c.customs_code = $1::text)
      ORDER BY p.code NULLS LAST, p.name`,
    [filter],
  )
  return rows.map((r) => ({ ...r, default_price: dec(r.default_price).toFixed() }))
}

export async function getInvoice(id: number): Promise<InvoiceRecord | null> {
  await requireAuth()
  const r = (await pool.query('SELECT * FROM invoices WHERE id = $1', [id])).rows[0]
  if (!r) return null
  const [clientRes, itemsRes, logRes] = await Promise.all([
    r.status !== 'finalized' && r.client_id
      ? pool.query('SELECT id, company_name, address_1, address_2, country, tax_id FROM clients WHERE id = $1', [r.client_id])
      : Promise.resolve({ rows: [] as Client[] }),
    pool.query(
      'SELECT id, item_code, order_name, customs_code, description, quantity, unit_price, line_total FROM invoice_items WHERE invoice_id = $1 ORDER BY position',
      [id],
    ),
    pool.query('SELECT * FROM invoice_logistics WHERE invoice_id = $1', [id]),
  ])
  // A finalized invoice shows the client exactly as it was when it was finalized.
  const client: Client | null = r.status === 'finalized' ? r.client_snapshot : clientRes.rows[0] ?? null
  const lg = logRes.rows[0]
  const clean = (v: unknown) => (v === null || v === undefined ? '' : dec(v as string).toFixed())
  return {
    id: r.id,
    status: r.status,
    number: r.number,
    year: r.year,
    client,
    issue_date: r.issue_date,
    currency: r.currency,
    vat_note: r.vat_note,
    items: itemsRes.rows.map((i) => ({ ...i, quantity: clean(i.quantity), unit_price: clean(i.unit_price) })),
    logistics: {
      customs_declaration: lg?.customs_declaration ?? '',
      transporter: lg?.transporter ?? '',
      gross_weight_kg: clean(lg?.gross_weight_kg),
      net_weight_kg: clean(lg?.net_weight_kg),
      pallets: lg?.pallets ?? null,
    },
    total_amount: r.total_amount,
    total_quantity: clean(r.total_quantity),
  }
}
const inYear = (c: string) =>
  `${c} >= date_trunc('year', CURRENT_DATE)::date AND ${c} < (date_trunc('year', CURRENT_DATE) + interval '1 year')::date`
const inMonth = (c: string) =>
  `${c} >= date_trunc('month', CURRENT_DATE)::date AND ${c} < (date_trunc('month', CURRENT_DATE) + interval '1 month')::date`
const inPrevMonth = (c: string) =>
  `${c} >= (date_trunc('month', CURRENT_DATE) - interval '1 month')::date AND ${c} < date_trunc('month', CURRENT_DATE)::date`

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAuth()
  const [totals, drafts, monthly, byCategory, topClients, categories, recent] = await Promise.all([
    pool.query(`
      SELECT
        EXTRACT(YEAR FROM CURRENT_DATE)::int AS year,
        COALESCE(SUM(total_amount) FILTER (WHERE ${inMonth('issue_date')}), 0) AS revenue_month,
        COALESCE(SUM(total_amount) FILTER (WHERE ${inPrevMonth('issue_date')}), 0) AS revenue_prev_month,
        COALESCE(SUM(total_amount) FILTER (WHERE ${inYear('issue_date')}), 0) AS revenue_year,
        (count(*) FILTER (WHERE ${inMonth('issue_date')}))::int AS invoices_month,
        (count(*) FILTER (WHERE ${inYear('issue_date')}))::int AS invoices_year
      FROM invoices WHERE status = 'finalized' AND currency = 'EUR'`),
    pool.query(`SELECT count(*)::int AS n FROM invoices WHERE status = 'draft'`),
    pool.query(`
      SELECT EXTRACT(MONTH FROM issue_date)::int AS m, SUM(total_amount) AS total
      FROM invoices WHERE status = 'finalized' AND currency = 'EUR' AND ${inYear('issue_date')} GROUP BY 1`),
    pool.query(`
      SELECT ii.customs_code, SUM(ii.line_total) AS total
      FROM invoice_items ii JOIN invoices i ON i.id = ii.invoice_id
      WHERE i.status = 'finalized' AND i.currency = 'EUR' AND ${inYear('i.issue_date')}
      GROUP BY ii.customs_code ORDER BY SUM(ii.line_total) DESC LIMIT 6`),
    pool.query(`
      SELECT i.client_id, COALESCE(i.client_snapshot->>'company_name', c.company_name, '(no client)') AS name,
             SUM(i.total_amount) AS total, count(*)::int AS count
      FROM invoices i LEFT JOIN clients c ON c.id = i.client_id
      WHERE i.status = 'finalized' AND i.currency = 'EUR' AND ${inYear('i.issue_date')}
      GROUP BY i.client_id, COALESCE(i.client_snapshot->>'company_name', c.company_name, '(no client)')
      ORDER BY SUM(i.total_amount) DESC LIMIT 5`),
    pool.query('SELECT customs_code, name FROM categories ORDER BY id'),
    listInvoices({}, 8),
  ])

  const t = totals.rows[0]
  const months: string[] = Array(12).fill('0')
  for (const r of monthly.rows) months[r.m - 1] = String(r.total)
  const names = new Map<string, string>()
  for (const c of categories.rows) if (!names.has(c.customs_code)) names.set(c.customs_code, c.name)

  return {
    year: t.year,
    revenue_month: String(t.revenue_month),
    revenue_prev_month: String(t.revenue_prev_month),
    revenue_year: String(t.revenue_year),
    invoices_month: t.invoices_month,
    invoices_year: t.invoices_year,
    drafts: drafts.rows[0].n,
    monthly: months,
    by_category: byCategory.rows.map((r) => ({ customs_code: r.customs_code, name: names.get(r.customs_code) ?? null, total: String(r.total) })),
    top_clients: topClients.rows.map((r) => ({ client_id: r.client_id, name: r.name, total: String(r.total), count: r.count })),
    recent,
  }
}