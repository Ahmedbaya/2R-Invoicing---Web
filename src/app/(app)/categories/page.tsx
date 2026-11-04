import Link from 'next/link'
import { getI18n } from '@/lib/i18n-server'
import { listCategories } from '@/lib/queries'

export default async function CategoriesPage() {
  const { t } = await getI18n()
  const categories = await listCategories()
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">{t('ca.title')}</h1>
      <div className="overflow-x-auto rounded border border-rule bg-white">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left">
            <tr><th className="p-2">{t('ca.name')}</th><th className="p-2">{t('ca.customs')}</th><th className="p-2 text-right">{t('ca.products')}</th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-rule">
                <td className="p-2 font-medium">{c.name}</td>
                <td className="p-2">{c.customs_code}</td>
                <td className="p-2 text-right">
                  <Link className="text-accent underline" href={`/products?customs=${encodeURIComponent(c.customs_code)}`}>{c.products}</Link>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td className="p-3" colSpan={3}>{t('ca.empty')}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}