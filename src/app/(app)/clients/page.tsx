import { getI18n } from '@/lib/i18n-server'
import { listClients } from '@/lib/queries'

export default async function ClientsPage() {
  const { t } = await getI18n()
  const clients = await listClients()
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">{t('cl.title')}</h1>
      <div className="overflow-x-auto rounded border border-rule bg-white">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left">
            <tr><th className="p-2">{t('cl.company')}</th><th className="p-2">{t('cl.address')}</th><th className="p-2">{t('cl.country')}</th><th className="p-2">{t('cl.taxId')}</th></tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t border-rule">
                <td className="p-2 font-medium">{c.company_name}</td>
                <td className="p-2">{[c.address_1, c.address_2].filter(Boolean).join(', ')}</td>
                <td className="p-2">{c.country}</td>
                <td className="p-2">{c.tax_id}</td>
              </tr>
            ))}
            {clients.length === 0 && <tr><td className="p-3" colSpan={4}>{t('cl.empty')}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}