import { listClients } from '@/lib/queries'

export default async function ClientsPage() {
  const clients = await listClients()
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Clients</h1>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr><th className="p-2">Company</th><th className="p-2">Address</th><th className="p-2">Country</th><th className="p-2">Tax ID</th></tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2 font-medium">{c.company_name}</td>
                <td className="p-2">{[c.address_1, c.address_2].filter(Boolean).join(', ')}</td>
                <td className="p-2">{c.country}</td>
                <td className="p-2">{c.tax_id}</td>
              </tr>
            ))}
            {clients.length === 0 && <tr><td className="p-3" colSpan={4}>No clients yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}