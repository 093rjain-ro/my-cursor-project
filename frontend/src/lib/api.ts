import { supabase } from './supabase'

const BASE = '/api'

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? ''}`,
  }
}

export const api = {
  async predict(payload: Record<string, unknown>) {
    const res = await fetch(`${BASE}/predict`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    })
    return res.json()
  },

  async history(limit = 10) {
    const res = await fetch(`${BASE}/history?limit=${limit}`, {
      headers: await authHeaders(),
    })
    return res.json()
  },

  async alerts(status = 'pending') {
    const res = await fetch(`${BASE}/alerts?status=${status}`, {
      headers: await authHeaders(),
    })
    return res.json()
  },

  async dismissAlert(id: string) {
    const res = await fetch(`${BASE}/alerts/${id}/dismiss`, {
      method: 'PATCH',
      headers: await authHeaders(),
    })
    return res.json()
  },

  async chat(message: string) {
    const res = await fetch(`${BASE}/chat`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ message }),
    })
    return res.json()
  },

  async stats() {
    const res = await fetch(`${BASE}/stats`, {
      headers: await authHeaders(),
    })
    return res.json()
  },

  async students() {
    const res = await fetch(`${BASE}/students`, {
      headers: await authHeaders(),
    })
    return res.json()
  },
}
