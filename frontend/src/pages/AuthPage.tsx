import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/ui'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const { signIn, signUp, profile } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode]         = useState<Mode>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [role, setRole]         = useState('student')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) { setError(error); setLoading(false); return }
    } else {
      const { error } = await signUp(email, password, name, role)
      if (error) { setError(error); setLoading(false); return }
    }
    setLoading(false)
  }

  if (profile) {
    const dest = profile.role === 'admin' ? '/admin'
      : profile.role === 'educator' ? '/educator' : '/student'
    navigate(dest, { replace: true })
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#4F8EF7 1px, transparent 1px), linear-gradient(90deg, #4F8EF7 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-signal-blue flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">E</span>
            </div>
            <span className="font-display font-bold text-xl text-white">EduSense</span>
          </div>
          <p className="text-slate-500 font-body text-sm">
            {mode === 'login' ? 'Welcome back. Sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        <div className="card">
          <div className="flex bg-ink-900 rounded-xl p-1 mb-6">
            {(['login', 'signup'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 text-sm font-display font-medium rounded-lg transition-all duration-200 capitalize
                  ${mode === m ? 'bg-ink-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="stagger-1 animate-fade-up">
                <label className="text-xs text-slate-400 font-mono mb-1.5 block">Full Name</label>
                <input className="input" placeholder="Dr. Priya Sharma" value={name}
                  onChange={e => setName(e.target.value)} required />
              </div>
            )}

            <div className="stagger-2 animate-fade-up">
              <label className="text-xs text-slate-400 font-mono mb-1.5 block">Email</label>
              <input className="input" type="email" placeholder="you@college.edu" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="stagger-3 animate-fade-up">
              <label className="text-xs text-slate-400 font-mono mb-1.5 block">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>

            {mode === 'signup' && (
              <div className="stagger-4 animate-fade-up">
                <label className="text-xs text-slate-400 font-mono mb-1.5 block">I am a</label>
                <div className="grid grid-cols-3 gap-2">
                  {['student', 'educator', 'admin'].map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`py-2.5 rounded-xl text-sm font-display capitalize border transition-all duration-200
                        ${role === r
                          ? 'border-signal-blue bg-signal-blue/10 text-signal-blue'
                          : 'border-ink-500 text-slate-500 hover:border-ink-400 hover:text-slate-300'}`}>
                      {r === 'student' ? '🎓' : r === 'educator' ? '👩🏫' : '⚙️'}<br/>
                      <span className="text-xs">{r}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm font-body">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 mt-2 stagger-5 animate-fade-up">
              {loading ? <><Spinner size={16} /> Please wait...</> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 font-body mt-6">
          EduSense — Powered by CatBoost + Gemini AI
        </p>
      </div>
    </div>
  )
}
