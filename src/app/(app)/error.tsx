'use client'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto mt-16 max-w-md rounded-lg border border-rule bg-white p-6 text-center">
      <h1 className="text-lg font-semibold">Could not load this page</h1>
      <p className="mt-2 text-sm text-ink/70">
        The database may be unreachable or paused. Check your connection, then try again.
      </p>
      <button onClick={reset} className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark">
        Try again
      </button>
    </div>
  )
}