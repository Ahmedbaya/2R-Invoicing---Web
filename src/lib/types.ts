export interface Client {
  id: number
  company_name: string
  address_1: string | null
  address_2: string | null
  country: string | null
  tax_id: string | null
}
export interface Category { id: number; name: string; customs_code: string; products: number }
export interface Product {
  id: number
  code: string | null
  name: string
  description: string | null
  default_price: string
  category_name: string | null
  customs_code: string | null
}
export interface InvoiceListRow {
  id: number
  status: 'draft' | 'finalized'
  number: number | null
  year: number | null
  issue_date: string
  currency: string
  total_amount: string
  total_quantity: string
  client_name: string | null
}
export interface InvoiceItem {
  id: number
  item_code: string
  order_name: string
  customs_code: string
  description: string
  quantity: string
  unit_price: string
  line_total: string
}
export interface InvoiceRecord {
  id: number
  status: 'draft' | 'finalized'
  number: number | null
  year: number | null
  client: Client | null
  issue_date: string
  currency: string
  vat_note: string
  items: InvoiceItem[]
  logistics: {
    customs_declaration: string
    transporter: string
    gross_weight_kg: string
    net_weight_kg: string
    pallets: number | null
  }
  total_amount: string
  total_quantity: string
}
export interface DashboardStats {
  year: number
  revenue_month: string
  revenue_prev_month: string
  revenue_year: string
  invoices_month: number
  invoices_year: number
  drafts: number
  monthly: string[] // 12 entries, January to December of the current year
  by_category: { customs_code: string; name: string | null; total: string }[]
  top_clients: { client_id: number | null; name: string; total: string; count: number }[]
  recent: InvoiceListRow[]
}