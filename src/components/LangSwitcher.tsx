import { LANGS, type Lang } from '@/lib/i18n'
import { setLang } from '@/lib/lang-actions'

export default function LangSwitcher({ current, dark = false }: { current: Lang; dark?: boolean }) {
  return (
    <form action={setLang} className="flex gap-1">
      {LANGS.map((l) => {
        const active = l.code === current
        const cls = dark
          ? active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
          : active ? 'bg-accent text-white' : 'text-ink/70 hover:bg-mist'
        return (
          <button key={l.code} name="lang" value={l.code} title={l.label} aria-label={l.label} aria-pressed={active} className={`rounded px-2 py-1 text-xs font-medium ${cls}`}>
            {l.short}
          </button>
        )
      })}
    </form>
  )
}