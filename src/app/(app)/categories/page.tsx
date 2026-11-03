import Link from 'next/link'
import { listCategories } from '@/lib/queries'

export default async function CategoriesPage() {
  const categories = await listCategories()
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Categories</h1>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr><th className="p-2">Name</th><th className="p-2">Customs code</th><th className="p-2 text-right">Products</th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2 font-medium">{c.name}</td>
                <td className="p-2">{c.customs_code}</td>
                <td className="p-2 text-right">
                  <Link className="text-blue-700 underline" href={`/products?customs=${encodeURIComponent(c.customs_code)}`}>{c.products}</Link>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td className="p-3" colSpan={3}>No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}