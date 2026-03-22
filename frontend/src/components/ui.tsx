import { ReactNode } from 'react'

export function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    low: 'badge-low', medium: 'badge-medium', high: 'badge-high', critical: 'badge-critical',
  }
  const icons: Record<string, string> = {
    low: '↑', medium: '→', high: '↓', critical: '↓↓',
  }
  return (
    <span className={map[level] ?? 'badge-medium'}>
      {icons[level]} {level?.toUpperCase()}
    </span>
  )
}

export function ScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score))
  const color = clamped >= 75 ? '#22C55E'
    : clamped >= 60 ? '#F59E0B'
    : clamped >= 45 ? '#F97316'
    : '#EF4444'
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (clamped / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1E2130" strokeWidth="10"/>
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="70" y="66" textAnchor="middle" fill={color}
          style={{ fontFamily: 'Syne', fontSize: '28px', fontWeight: 700 }}>
          {Math.round(clamped)}
        </text>
        <text x="70" y="84" textAnchor="middle" fill="#64748b"
          style={{ fontFamily: 'DM Sans', fontSize: '11px' }}>
          out of 100
        </text>
      </svg>
    </div>
  )
}

export function ShapBar({ feature, value }: { feature: string; value: number }) {
  const isPos = value >= 0
  const width = Math.min(Math.abs(value) * 6, 100)
  const label = feature.replace(/_/g, ' ')
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-slate-400 font-body w-44 truncate capitalize">{label}</span>
      <div className="flex-1 flex items-center gap-1.5">
        <div className="flex-1 h-1.5 bg-ink-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${width}%`,
              background: isPos ? '#22C55E' : '#EF4444',
              marginLeft: isPos ? '0' : 'auto',
            }}
          />
        </div>
        <span className={`text-xs font-mono w-12 text-right ${isPos ? 'text-green-400' : 'text-red-400'}`}>
          {isPos ? '+' : ''}{value.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#363A52" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="#4F8EF7" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

export function StatCard({ label, value, sub, accent = '#4F8EF7' }: {
  label: string; value: string | number; sub?: string; accent?: string
}) {
  return (
    <div className="card-sm flex flex-col gap-1 animate-fade-up">
      <span className="text-xs text-slate-500 font-body uppercase tracking-widest">{label}</span>
      <span className="text-3xl font-display font-bold" style={{ color: accent }}>{value}</span>
      {sub && <span className="text-xs text-slate-500 font-body">{sub}</span>}
    </div>
  )
}

export function PageShell({ title, subtitle, children }: {
  title: string; subtitle?: string; children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-ink-950 px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-3xl font-display font-bold text-white">{title}</h1>
        {subtitle && <p className="text-slate-400 font-body mt-1 text-sm">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
      {children}
    </p>
  )
}
