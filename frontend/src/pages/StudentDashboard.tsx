import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { ScoreGauge, RiskBadge, ShapBar, StatCard, SectionLabel, Spinner } from '../components/ui'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const FORM_DEFAULTS = {
  gender: '', race_ethnicity: '', parental_level_of_education: '',
  lunch: '', test_preparation_course: '',
  reading_score: '', writing_score: '',
}

interface ChatMsg { role: 'user' | 'assistant'; text: string }

export default function StudentDashboard() {
  const { profile, signOut } = useAuth()

  const [form, setForm]             = useState(FORM_DEFAULTS)
  const [result, setResult]         = useState<any>(null)
  const [predicting, setPredicting] = useState(false)
  const [predError, setPredError]   = useState('')
  const [history, setHistory]       = useState<any[]>([])
  const [histLoading, setHistLoading] = useState(true)
  const [chat, setChat]             = useState<ChatMsg[]>([])
  const [chatInput, setChatInput]   = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [tab, setTab]               = useState<'predict' | 'history' | 'chat'>('predict')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.history(8).then(r => { setHistory(r.predictions || []); setHistLoading(false) })
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault()
    setPredError('')
    setPredicting(true)
    const payload = { ...form, reading_score: Number(form.reading_score), writing_score: Number(form.writing_score) }
    const data = await api.predict(payload)
    if (data.error) { setPredError(data.error); setPredicting(false); return }
    setResult(data)
    setPredicting(false)
    api.history(8).then(r => setHistory(r.predictions || []))
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChat(c => [...c, { role: 'user', text: msg }])
    setChatInput('')
    setChatLoading(true)
    const data = await api.chat(msg)
    setChat(c => [...c, { role: 'assistant', text: data.reply || data.response || 'Something went wrong.' }])
    setChatLoading(false)
  }

  const chartData = [...history].reverse().map((p, i) => ({ name: `#${i + 1}`, score: Number(p.predicted_score) }))
  const latestRisk = history[0]?.risk_level
  const avgScore = history.length
    ? (history.reduce((s, p) => s + Number(p.predicted_score), 0) / history.length).toFixed(1) : '--'

  return (
    <div className="min-h-screen bg-ink-950">
      <nav className="border-b border-ink-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-signal-blue flex items-center justify-center">
            <span className="text-white font-display font-bold text-xs">E</span>
          </div>
          <span className="font-display font-semibold text-white">EduSense</span>
          <span className="text-ink-500 text-sm hidden sm:block">/ Student</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm font-body hidden sm:block">{profile?.full_name}</span>
          <button onClick={signOut} className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors">Sign out</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-display font-bold text-white">Hey, {profile?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 font-body text-sm mt-1">Track your predicted performance and get personalised guidance.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Predictions" value={history.length} sub="total runs" />
          <StatCard label="Avg Score" value={avgScore} sub="predicted" accent="#2DD4BF" />
          <StatCard label="Current Risk" value={latestRisk ? latestRisk.toUpperCase() : '--'} sub="latest check"
            accent={latestRisk === 'low' ? '#22C55E' : latestRisk === 'medium' ? '#F59E0B' : latestRisk === 'high' ? '#F97316' : '#EF4444'} />
          <StatCard label="Sessions" value={chat.length > 0 ? Math.ceil(chat.length / 2) : 0} sub="AI chats" accent="#A78BFA" />
        </div>

        <div className="flex gap-1 bg-ink-800 border border-ink-600 rounded-2xl p-1 mb-6 w-fit">
          {(['predict', 'history', 'chat'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-display capitalize transition-all duration-200
                ${tab === t ? 'bg-signal-blue text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              {t === 'predict' ? '🔮 Predict' : t === 'history' ? '📊 History' : '🤖 AI Chat'}
            </button>
          ))}
        </div>

        {tab === 'predict' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card animate-fade-up">
              <SectionLabel>Input your details</SectionLabel>
              <form onSubmit={handlePredict} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-mono mb-1.5 block">Gender</label>
                    <select className="select" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} required>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-mono mb-1.5 block">Ethnicity</label>
                    <select className="select" value={form.race_ethnicity} onChange={e => setForm(f => ({ ...f, race_ethnicity: e.target.value }))} required>
                      <option value="">Select</option>
                      {['group A','group B','group C','group D','group E'].map(g => (
                        <option key={g} value={g}>{g.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-mono mb-1.5 block">Parental Education</label>
                  <select className="select" value={form.parental_level_of_education}
                    onChange={e => setForm(f => ({ ...f, parental_level_of_education: e.target.value }))} required>
                    <option value="">Select</option>
                    {["some high school","high school","some college","associate's degree","bachelor's degree","master's degree"]
                      .map(e => <option key={e} value={e}>{e.replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-mono mb-1.5 block">Lunch Type</label>
                    <select className="select" value={form.lunch} onChange={e => setForm(f => ({ ...f, lunch: e.target.value }))} required>
                      <option value="">Select</option>
                      <option value="standard">Standard</option>
                      <option value="free/reduced">Free / Reduced</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-mono mb-1.5 block">Test Prep</label>
                    <select className="select" value={form.test_preparation_course}
                      onChange={e => setForm(f => ({ ...f, test_preparation_course: e.target.value }))} required>
                      <option value="">Select</option>
                      <option value="none">None</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-mono mb-1.5 block">Reading Score</label>
                    <input className="input" type="number" min="0" max="100" placeholder="0 – 100"
                      value={form.reading_score} onChange={e => setForm(f => ({ ...f, reading_score: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-mono mb-1.5 block">Writing Score</label>
                    <input className="input" type="number" min="0" max="100" placeholder="0 – 100"
                      value={form.writing_score} onChange={e => setForm(f => ({ ...f, writing_score: e.target.value }))} required />
                  </div>
                </div>

                {predError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{predError}</div>
                )}

                <button type="submit" disabled={predicting} className="btn-primary flex items-center justify-center gap-2">
                  {predicting ? <><Spinner size={16} /> Predicting...</> : '🔮 Predict My Math Score'}
                </button>
              </form>
            </div>

            <div className="card animate-fade-up stagger-2">
              {!result ? (
                <div className="flex flex-col items-center justify-center h-full min-h-64 gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-ink-700 flex items-center justify-center text-3xl">🎯</div>
                  <p className="text-slate-400 font-body text-sm">Fill in the form and hit Predict<br/>to see your results here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <SectionLabel>Your result</SectionLabel>
                    <RiskBadge level={result.risk_level} />
                  </div>
                  <div className="flex justify-center">
                    <ScoreGauge score={result.predicted_score} />
                  </div>
                  {result.shap_values && Object.keys(result.shap_values).length > 0 && (
                    <div>
                      <SectionLabel>What's driving this score</SectionLabel>
                      <div className="flex flex-col gap-0.5">
                        {Object.entries(result.shap_values as Record<string, number>).map(([k, v]) => (
                          <ShapBar key={k} feature={k} value={v} />
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => setTab('chat')} className="btn-ghost text-center text-sm">
                    💬 Ask AI what to do next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="flex flex-col gap-6 animate-fade-up">
            {chartData.length > 1 && (
              <div className="card">
                <SectionLabel>Score trend over time</SectionLabel>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#161820', border: '1px solid #363A52', borderRadius: 8, color: '#e2e8f0' }} />
                    <Line type="monotone" dataKey="score" stroke="#4F8EF7" strokeWidth={2} dot={{ fill: '#4F8EF7', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="card">
              <SectionLabel>All predictions</SectionLabel>
              {histLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : history.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8 font-body">No predictions yet. Run your first one!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-ink-600">
                        {['Date','Predicted Score','Risk','Reading','Writing'].map(h => (
                          <th key={h} className="pb-3 text-xs font-mono text-slate-500 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-700">
                      {history.map(p => (
                        <tr key={p.id} className="hover:bg-ink-800/50 transition-colors">
                          <td className="py-3 pr-4 text-slate-400 font-mono text-xs">
                            {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-display font-bold text-white">{Number(p.predicted_score).toFixed(1)}</span>
                            <span className="text-slate-500 text-xs">/100</span>
                          </td>
                          <td className="py-3 pr-4"><RiskBadge level={p.risk_level} /></td>
                          <td className="py-3 pr-4 text-slate-400 font-mono">{p.reading_score ?? '--'}</td>
                          <td className="py-3 text-slate-400 font-mono">{p.writing_score ?? '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div className="card animate-fade-up flex flex-col" style={{ height: '60vh' }}>
            <SectionLabel>AI Academic Advisor</SectionLabel>
            <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 mb-4">
              {chat.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="text-4xl">🤖</div>
                  <p className="text-slate-400 font-body text-sm max-w-xs">
                    Hi {profile?.full_name?.split(' ')[0]}! Ask me anything about your performance,
                    what to study, or how to improve your predicted score.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {["Why is my score low?", "What should I study first?", "How do I improve fast?"].map(q => (
                      <button key={q} onClick={() => setChatInput(q)}
                        className="text-xs border border-ink-500 text-slate-400 px-3 py-1.5 rounded-full hover:border-signal-blue hover:text-signal-blue transition-colors font-body">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl text-sm font-body leading-relaxed
                    ${m.role === 'user'
                      ? 'bg-signal-blue text-white rounded-br-sm'
                      : 'bg-ink-700 border border-ink-600 text-slate-200 rounded-bl-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                   <div className="bg-ink-700 border border-ink-600 text-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-2 w-fit">
                     <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></span>
                     <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse delay-75"></span>
                     <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse delay-150"></span>
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendChat} className="flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                placeholder="Message AI..." className="input !rounded-full" disabled={chatLoading} />
              <button type="submit" disabled={chatLoading} className="btn-primary !rounded-full px-6">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
