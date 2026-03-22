import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Spinner, SectionLabel } from '../components/ui'

export default function StudentProfile() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const [name, setName]     = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() })
      .eq('id', profile!.id)
    if (error) { setError(error.message) }
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-ink-950">
      <nav className="border-b border-ink-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/student')} className="text-slate-400 hover:text-white font-mono text-sm transition-colors">
            ← Back
          </button>
          <span className="text-ink-500">|</span>
          <span className="font-display font-semibold text-white text-sm">Edit Profile</span>
        </div>
        <button onClick={signOut} className="text-xs text-slate-500 hover:text-slate-300 font-mono">Sign out</button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="flex flex-col items-center mb-10 animate-fade-up">
          <div className="w-20 h-20 rounded-2xl bg-signal-blue/20 border-2 border-signal-blue/40 flex items-center justify-center mb-3">
            <span className="font-display font-bold text-signal-blue text-2xl">{initials || '?'}</span>
          </div>
          <span className="text-slate-400 text-sm font-body">{profile?.email}</span>
          <span className="text-xs font-mono text-slate-600 mt-1 bg-ink-700 px-2.5 py-1 rounded-full capitalize">
            {profile?.role}
          </span>
        </div>

        <div className="card animate-fade-up stagger-1">
          <SectionLabel>Personal info</SectionLabel>
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1.5 block">Full Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your full name" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1.5 block">Email</label>
              <input className="input opacity-50 cursor-not-allowed" value={profile?.email ?? ''} disabled />
              <p className="text-xs text-slate-600 font-body mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-mono mb-1.5 block">Role</label>
              <input className="input opacity-50 cursor-not-allowed capitalize" value={profile?.role ?? ''} disabled />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm font-body">{error}</div>
            )}
            {saved && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm font-body">
                ✅ Profile updated successfully.
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2">
              {saving ? <><Spinner size={16} /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="card border-red-500/20 mt-4 animate-fade-up stagger-2">
          <SectionLabel>Account</SectionLabel>
          <p className="text-slate-400 text-sm font-body mb-4">
            Signing out will end your session. Your data stays saved.
          </p>
          <button onClick={signOut}
            className="btn-ghost text-red-400 border-red-500/30 hover:border-red-500/60 hover:text-red-300 w-full">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
