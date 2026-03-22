import { useNavigate } from 'react-router-dom'

const FEATURES = [
  { icon: '🔮', title: 'Predict Before It\'s Too Late', desc: 'CatBoost ML model predicts math scores with 88% accuracy before exams happen.' },
  { icon: '🧠', title: 'Understand Why', desc: 'SHAP explainability breaks down exactly which factors are pulling a student\'s score down.' },
  { icon: '🚨', title: 'Automatic Early Alerts', desc: 'Educators get instant email alerts when a student crosses into high or critical risk.' },
  { icon: '🤖', title: 'Gemini AI Advisor', desc: 'Every student gets a private AI tutor that gives personalised, actionable study guidance.' },
  { icon: '📊', title: 'Track Trends Over Time', desc: 'Rolling prediction history shows whether a student is improving or drifting further at risk.' },
  { icon: '🔐', title: 'Role-Based Access', desc: 'Students, educators, and admins each see exactly what they need — nothing more.' },
]

const STATS = [
  { value: '88%', label: 'Model Accuracy (R²)' },
  { value: '3', label: 'User Roles' },
  { value: '<2s', label: 'Prediction Time' },
  { value: '7', label: 'SHAP Features Explained' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-ink-950 overflow-x-hidden">
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#4F8EF7 1px, transparent 1px), linear-gradient(90deg, #4F8EF7 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-5 border-b border-ink-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-signal-blue flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">E</span>
          </div>
          <span className="font-display font-bold text-lg text-white">EduSense</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/auth')} className="btn-ghost py-2 px-4 text-sm">Sign In</button>
          <button onClick={() => navigate('/auth')} className="btn-primary py-2 px-4 text-sm">Get Started →</button>
        </div>
      </nav>

      <section className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-signal-blue/10 border border-signal-blue/30 rounded-full px-4 py-1.5 mb-8 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-blue animate-pulse-soft" />
          <span className="text-signal-blue text-xs font-mono">Powered by CatBoost + Gemini AI</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-display font-extrabold text-white leading-[1.05] mb-6 animate-fade-up stagger-1">
          Predict failure.<br />
          <span className="text-signal-blue">Prevent it.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 font-body max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up stagger-2">
          EduSense uses machine learning to identify at-risk students before they fail —
          giving educators the insights to intervene early and students the guidance to improve.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up stagger-3">
          <button onClick={() => navigate('/auth')} className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
            Start for Free →
          </button>
          <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-ghost text-base px-8 py-3.5 w-full sm:w-auto">
            See how it works
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 animate-fade-up stagger-4">
          {STATS.map(s => (
            <div key={s.label} className="card-sm text-center">
              <div className="text-3xl font-display font-extrabold text-signal-blue">{s.value}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 pb-24">
        <div className="card border-ink-500 overflow-hidden p-0">
          <div className="bg-ink-700 px-4 py-3 flex items-center gap-2 border-b border-ink-600">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
            </div>
            <div className="flex-1 bg-ink-800 rounded-md mx-4 py-1.5 px-3 text-xs text-slate-500 font-mono text-center">
              edusense.app/student
            </div>
          </div>
          <div className="p-6 bg-ink-900">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="h-5 w-40 bg-ink-700 rounded-md mb-2" />
                <div className="h-3 w-56 bg-ink-800 rounded-md" />
              </div>
              <div className="h-8 w-24 bg-signal-blue/20 border border-signal-blue/30 rounded-xl" />
            </div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {['#4F8EF7','#2DD4BF','#F59E0B','#A78BFA'].map((c, i) => (
                <div key={i} className="bg-ink-800 border border-ink-600 rounded-xl p-4">
                  <div className="h-3 w-16 bg-ink-700 rounded mb-3" />
                  <div className="h-8 w-12 rounded-md" style={{ background: c + '33' }} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ink-800 border border-ink-600 rounded-xl p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-3 rounded-md bg-ink-700" style={{ width: `${70 + i * 5}%` }} />
                ))}
                <div className="h-9 w-full bg-signal-blue/20 border border-signal-blue/30 rounded-xl mt-4" />
              </div>
              <div className="bg-ink-800 border border-ink-600 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                <div className="w-24 h-24 rounded-full border-8 border-ink-700 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-8 border-signal-blue/60 flex items-center justify-center">
                    <span className="font-display font-bold text-signal-blue text-lg">72</span>
                  </div>
                </div>
                <div className="h-3 w-24 bg-ink-700 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 pb-24">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-signal-blue uppercase tracking-widest mb-3">Platform features</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            Everything educators and students need
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card hover:border-ink-500 transition-colors duration-200 animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-display font-semibold text-white text-base mb-2">{f.title}</h3>
              <p className="text-slate-400 font-body text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 pb-24">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-signal-teal uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">From data to action in seconds</h2>
        </div>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Student submits', desc: 'Enters their reading & writing scores and background info.' },
            { step: '02', title: 'Model predicts', desc: 'CatBoost predicts the math score with SHAP breakdown.' },
            { step: '03', title: 'Risk assessed', desc: 'Platform flags High or Critical risk and fires an alert.' },
            { step: '04', title: 'Educator acts', desc: 'Teacher receives email, views student SHAP, intervenes.' },
          ].map((s, i) => (
            <div key={s.step} className="card-sm animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="font-mono text-xs text-signal-teal mb-3">{s.step}</div>
              <h4 className="font-display font-semibold text-white text-sm mb-2">{s.title}</h4>
              <p className="text-slate-500 font-body text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 pb-32">
        <div className="card border-signal-blue/30 bg-signal-blue/5 text-center py-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Ready to stop reacting<br/>and start preventing?
          </h2>
          <p className="text-slate-400 font-body text-base mb-8 max-w-md mx-auto">
            Join educators who use EduSense to catch at-risk students weeks before exams.
          </p>
          <button onClick={() => navigate('/auth')} className="btn-primary text-base px-10 py-3.5">
            Get Started Free →
          </button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-ink-700 px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-signal-blue flex items-center justify-center">
            <span className="text-white font-display font-bold text-xs">E</span>
          </div>
          <span className="font-display text-sm text-white font-semibold">EduSense</span>
        </div>
        <p className="text-xs text-slate-600 font-mono">Built with CatBoost · SHAP · Gemini · Supabase · React</p>
        <button onClick={() => navigate('/auth')} className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors">
          Sign in →
        </button>
      </footer>
    </div>
  )
}
