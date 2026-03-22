import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { StatCard, SectionLabel, Spinner } from '../components/ui'

export default function AdminDashboard() {
  const { profile, signOut } = useAuth()
  const [stats, setStats]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.stats().then(data => { setStats(data); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-ink-950">
      <nav className="border-b border-ink-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-signal-purple flex items-center justify-center">
            <span className="text-white font-display font-bold text-xs">E</span>
          </div>
          <span className="font-display font-semibold text-white">EduSense</span>
          <span className="text-ink-500 text-sm hidden sm:block">/ Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm font-body hidden sm:block">{profile?.full_name}</span>
          <button onClick={signOut} className="text-xs text-slate-500 hover:text-slate-300 font-mono">Sign out</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-display font-bold text-white">Platform Overview</h1>
          <p className="text-slate-400 font-body text-sm mt-1">Real-time platform health and usage statistics.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size={32} /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Students"    value={stats?.total_students ?? 0}    accent="#2DD4BF" />
              <StatCard label="Total Predictions" value={stats?.total_predictions ?? 0}  accent="#4F8EF7" />
              <StatCard label="Pending Alerts"    value={stats?.pending_alerts ?? 0}     accent="#F59E0B" />
              <StatCard label="High Risk"         value={stats?.high_risk_count ?? 0}    sub="high + critical" accent="#EF4444" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card animate-fade-up stagger-2">
                <SectionLabel>Platform health</SectionLabel>
                <div className="flex flex-col gap-3 mt-2">
                  {[
                    { label: 'ML Model',     value: 'CatBoost v1 · R² 0.88',  ok: true },
                    { label: 'SHAP Layer',   value: 'TreeExplainer · Active',  ok: true },
                    { label: 'Gemini AI',    value: 'gemini-1.5-pro · Live',   ok: true },
                    { label: 'Alert Engine', value: 'Auto-trigger · Active',   ok: true },
                    { label: 'Database',     value: 'Supabase PostgreSQL',      ok: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-ink-700 last:border-0">
                      <span className="text-sm font-body text-slate-300">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">{item.value}</span>
                        <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-green-400 animate-pulse-soft' : 'bg-red-400'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card animate-fade-up stagger-3">
                <SectionLabel>Risk alert rate</SectionLabel>
                <div className="flex flex-col gap-4 mt-2">
                  {stats && [
                    { label: 'High Risk Students', value: stats.high_risk_count, total: stats.total_students, color: '#F97316' },
                    { label: 'Pending Alerts',     value: stats.pending_alerts,   total: stats.total_predictions, color: '#F59E0B' },
                  ].map(item => {
                    const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
                          <span>{item.label}</span>
                          <span>{item.value} / {item.total} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-ink-600 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: item.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
