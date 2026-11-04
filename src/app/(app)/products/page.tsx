import Link from 'next/link'
import { formatNumber } from '@/lib/calc'
import { getI18n } from '@/lib/i18n-server'
import { listCategories, listProducts } from '@/lib/queries'

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ customs?: string }> }) {
  const { t } = await getI18n()
  const { customs } = await searchParams
  const [products, categories] = await Promise.all([listProducts(customs), listCategories()])

  const options = new Map<string, string[]>()
  for (const c of categories) options.set(c.customs_code, [...(options.get(c.customs_code) ?? []), c.name])

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">{t('pr.title')}</h1>
      <form method="get" className="mb-3 flex flex-wrap items-center gap-3">
        <label className="text-sm" htmlFor="customs">{t('pr.customs')}</label>
        <select id="customs" name="customs" defaultValue={customs ?? ''} className="rounded border border-rule bg-white px-2 py-1.5 text-sm">
          <option value="">{t('pr.allCustoms')}</option>
          {[...options].map(([code, names]) => <option key={code} value={code}>{code} · {names.join(', ')}</option>)}
          <option value="__none__">{t('pr.none')}</option>
        </select>
        <button className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-dark">{t('inv.filter')}</button>
        {customs && <Link href="/products" className="text-sm underline">{t('inv.clear')}</Link>}
        <span className="text-sm text-ink/70">{t('pr.count', { n: products.length })}</span>
      </form>
      <div className="overflow-x-auto rounded border border-rule bg-white">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left">
            <tr>
              <th className="p-2">{t('pr.code')}</th><th className="p-2">{t('pr.name')}</th><th className="p-2">{t('pr.description')}</th>
              <th className="p-2">{t('pr.category')}</th><th className="p-2">{t('pr.customs')}</th><th className="p-2 text-right">{t('pr.price')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-rule">
                <td className="p-2 font-medium">{p.code}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.description}</td>
                <td className="p-2">{p.category_name}</td>
                <td className="p-2">{p.customs_code}</td>
                <td className="p-2 text-right tabular-nums">{formatNumber(p.default_price)}</td>
              </tr>
            ))}
            {products.length === 0 && <tr><td className="p-3" colSpan={6}>{t('pr.noMatch')}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}