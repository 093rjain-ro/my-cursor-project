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

export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-3 w-24 bg-ink-600 rounded-md mb-4" />
      <div className="h-8 w-16 bg-ink-700 rounded-md mb-2" />
      <div className="h-3 w-20 bg-ink-600 rounded-md" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-ink-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-ink-700 rounded-md w-36" />
        <div className="h-3 bg-ink-800 rounded-md w-48" />
      </div>
      <div className="h-6 w-16 bg-ink-700 rounded-full" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-32 bg-ink-600 rounded-md mb-5" />
      <div className="flex items-end gap-2 h-32">
        {[40, 65, 50, 80, 55, 70, 45, 90].map((h, i) => (
          <div key={i} className="flex-1 bg-ink-700 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonAlert() {
  return (
    <div className="rounded-xl p-3 border border-ink-600 animate-pulse space-y-2">
      <div className="flex justify-between">
        <div className="h-3 w-24 bg-ink-700 rounded-md" />
        <div className="h-5 w-16 bg-ink-700 rounded-full" />
      </div>
      <div className="h-3 w-full bg-ink-800 rounded-md" />
      <div className="h-3 w-3/4 bg-ink-800 rounded-md" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 space-y-2 animate-pulse">
        <div className="h-7 w-52 bg-ink-700 rounded-md" />
        <div className="h-4 w-72 bg-ink-800 rounded-md" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="h-3 w-28 bg-ink-600 rounded-md animate-pulse" />
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
        <div className="card">
          <SkeletonChart />
        </div>
      </div>
    </div>
  )
}
