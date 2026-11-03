import Link from 'next/link'
import { formatNumber } from '@/lib/calc'
import { listCategories, listProducts } from '@/lib/queries'

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ customs?: string }> }) {
  const { customs } = await searchParams
  const [products, categories] = await Promise.all([listProducts(customs), listCategories()])

  const options = new Map<string, string[]>()
  for (const c of categories) options.set(c.customs_code, [...(options.get(c.customs_code) ?? []), c.name])

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Products</h1>
      <form method="get" className="mb-3 flex flex-wrap items-center gap-3">
        <label className="text-sm" htmlFor="customs">Customs code</label>
        <select id="customs" name="customs" defaultValue={customs ?? ''} className="rounded border bg-white px-2 py-1.5 text-sm">
          <option value="">All customs codes</option>
          {[...options].map(([code, names]) => <option key={code} value={code}>{code} · {names.join(', ')}</option>)}
          <option value="__none__">No customs code</option>
        </select>
        <button className="rounded bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800">Filter</button>
        {customs && <Link href="/products" className="text-sm underline">Clear</Link>}
        <span className="text-sm text-slate-600">{products.length} products</span>
      </form>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-2">Code</th><th className="p-2">Name</th><th className="p-2">Description</th>
              <th className="p-2">Category</th><th className="p-2">Customs code</th><th className="p-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2 font-medium">{p.code}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.description}</td>
                <td className="p-2">{p.category_name}</td>
                <td className="p-2">{p.customs_code}</td>
                <td className="p-2 text-right tabular-nums">{formatNumber(p.default_price)}</td>
              </tr>
            ))}
            {products.length === 0 && <tr><td className="p-3" colSpan={6}>No product matches.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}