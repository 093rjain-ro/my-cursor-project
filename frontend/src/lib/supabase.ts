import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnon)

export type UserRole = 'student' | 'educator' | 'admin'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  class_id?: string
  avatar_url?: string
}

export interface Prediction {
  id: string
  predicted_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  shap_values: Record<string, number>
  created_at: string
  student_submissions?: {
    reading_score: number
    writing_score: number
  }
}

export interface Alert {
  id: string
  student_id: string
  risk_level: string
  message: string
  status: string
  created_at: string
  profiles?: { full_name: string; email: string }
}

export interface Student {
  id: string
  full_name: string
  email: string
  latest_prediction?: Prediction | null
}
