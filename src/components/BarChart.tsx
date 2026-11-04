const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',')} k` : String(Math.round(n)))
const eur = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`

export default function BarChart({ values, months, currentMonth, label }: { values: number[]; months: string[]; currentMonth: number; label: string }) {
  const W = 600
  const base = 190
  const top = 20
  const max = Math.max(...values, 1)
  const slot = W / 12
  const bw = slot * 0.6
  return (
    <svg viewBox={`0 0 ${W} 214`} className="w-full" role="img" aria-label={label}>
      <line x1="0" x2={W} y1={base} y2={base} className="stroke-rule" />
      {values.map((v, i) => {
        const h = (v / max) * (base - top)
        const x = i * slot + (slot - bw) / 2
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={bw} height={v > 0 ? Math.max(h, 2) : 0} rx="3" className={i === currentMonth ? 'fill-accent' : 'fill-accent/40'}>
              <title>{`${months[i]}: ${eur(v)}`}</title>
            </rect>
            {v > 0 && <text x={x + bw / 2} y={base - h - 5} textAnchor="middle" className="fill-ink text-[10px]">{compact(v)}</text>}
            <text x={x + bw / 2} y={base + 16} textAnchor="middle" className="fill-ink/60 text-[11px]">{months[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}