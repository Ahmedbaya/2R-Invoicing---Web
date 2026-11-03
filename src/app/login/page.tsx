import Image from 'next/image'
import { login } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-lg border border-rule bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-lg" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">2R Confection</h1>
            <p className="text-sm text-ink/70">Invoicing</p>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoFocus className="w-full rounded border border-rule px-3 py-2" />
        </div>
        {error && <p role="alert" className="text-sm text-danger">Wrong password.</p>}
        <button className="w-full rounded bg-accent px-3 py-2 font-medium text-white hover:bg-accent-dark">Sign in</button>
      </form>
    </main>
  )
}