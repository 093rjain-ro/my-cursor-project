import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { RiskBadge, ShapBar, StatCard, SectionLabel, Spinner } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const RISK_COLORS: Record<string, string> = {
  low: '#22C55E', medium: '#F59E0B', high: '#F97316', critical: '#EF4444'
}

export default function EducatorDashboard() {
  const { profile, signOut } = useAuth()

  const [students, setStudents]     = useState<any[]>([])
  const [alerts, setAlerts]         = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState<any>(null)
  const [alertTab, setAlertTab]     = useState<'pending' | 'active' | 'all'>('active')
  const [search, setSearch]         = useState('')

  useEffect(() => {
    Promise.all([api.students(), api.alerts(alertTab)]).then(([s, a]) => {
      setStudents(s || [])
      setAlerts(a || [])
      setLoading(false)
    })
  }, [alertTab])

  async function handleDismiss(alertId: string) {
    await api.dismissAlert(alertId)
    setAlerts(a => a.filter(x => x.id !== alertId))
  }

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  const riskCounts = ['low','medium','high','critical'].map(r => ({
    risk: r,
    count: students.filter(s => s.latest_prediction?.risk_level === r).length,
  }))

  const atRiskCount = students.filter(s => ['high','critical'].includes(s.latest_prediction?.risk_level)).length
  const avgScore = students.length
    ? (students.reduce((sum, s) => sum + (Number(s.latest_prediction?.predicted_score) || 0), 0) / students.length).toFixed(1) : '--'

  return (
    <div className="min-h-screen bg-ink-950">
      <nav className="border-b border-ink-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-signal-teal flex items-center justify-center">
            <span className="text-ink-900 font-display font-bold text-xs">E</span>
          </div>
          <span className="font-display font-semibold text-white">EduSense</span>
          <span className="text-ink-500 text-sm hidden sm:block">/ Educator</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm font-body hidden sm:block">{profile?.full_name}</span>
          <button onClick={signOut} className="text-xs text-slate-500 hover:text-slate-300 font-mono">Sign out</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-display font-bold text-white">Class Overview</h1>
          <p className="text-slate-400 font-body text-sm mt-1">Monitor at-risk students and track class-wide performance.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total Students" value={students.length} accent="#2DD4BF" />
          <StatCard label="At Risk" value={atRiskCount} sub="high + critical" accent="#EF4444" />
          <StatCard label="Class Avg" value={avgScore} sub="predicted score" accent="#4F8EF7" />
          <StatCard label="Active Alerts" value={alerts.filter(a => a.status === 'active' || a.status === 'pending').length} accent="#F59E0B" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="card animate-fade-up stagger-1">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>Students</SectionLabel>
                <input className="input w-48 py-2 text-xs" placeholder="Search student..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {loading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : filtered.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8 font-body">No students found.</p>
              ) : (
                <div className="flex flex-col divide-y divide-ink-700">
                  {filtered.map(s => (
                    <div key={s.id} onClick={() => setSelected(selected?.id === s.id ? null : s)}
                      className={`py-4 cursor-pointer transition-all duration-200 rounded-xl px-3 -mx-3
                        ${selected?.id === s.id ? 'bg-ink-700' : 'hover:bg-ink-800/60'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-ink-600 flex items-center justify-center text-sm font-display font-bold text-signal-blue">
                            {s.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-display font-medium text-white">{s.full_name}</p>
                            <p className="text-xs text-slate-500 font-mono">{s.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {s.latest_prediction ? (
                            <>
                              <span className="font-mono text-sm text-white">{Number(s.latest_prediction.predicted_score).toFixed(1)}</span>
                              <RiskBadge level={s.latest_prediction.risk_level} />
                            </>
                          ) : (
                            <span className="text-xs text-slate-600 font-mono">No data</span>
                          )}
                        </div>
                      </div>
                      {selected?.id === s.id && s.latest_prediction?.shap_values && (
                        <div className="mt-4 pt-4 border-t border-ink-600">
                          <p className="text-xs font-mono text-slate-500 mb-3">Why this score?</p>
                          {Object.entries(s.latest_prediction.shap_values as Record<string, number>).map(([k, v]) => (
                            <ShapBar key={k} feature={k} value={v} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card animate-fade-up stagger-2">
              <SectionLabel>Risk distribution</SectionLabel>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={riskCounts} barSize={36}>
                  <XAxis dataKey="risk" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#161820', border: '1px solid #363A52', borderRadius: 8, color: '#e2e8f0' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {riskCounts.map(r => <Cell key={r.risk} fill={RISK_COLORS[r.risk]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card animate-fade-up stagger-3 h-fit">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Early Alerts</SectionLabel>
              <div className="flex gap-1 bg-ink-900 rounded-lg p-0.5">
                {(['pending', 'all'] as const).map(t => (
                  <button key={t} onClick={() => setAlertTab(t)}
                    className={`px-3 py-1 rounded-md text-xs font-mono capitalize transition-colors
                      ${alertTab === t ? 'bg-ink-600 text-white' : 'text-slate-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-slate-500 text-sm font-body">No {alertTab} alerts.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {alerts.map(a => (
                  <div key={a.id} className={`rounded-xl p-3 border text-sm font-body
                    ${a.risk_level === 'critical' ? 'bg-red-500/5 border-red-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-display font-medium text-white text-xs">{a.profiles?.full_name ?? 'Unknown'}</span>
                      <RiskBadge level={a.risk_level || 'high'} />
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{a.message || 'No specific details provided.'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-600 font-mono">
                        {new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                      {a.status === 'pending' || a.status === 'active' && (
                        <button onClick={() => handleDismiss(a.id)}
                          className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors">
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
