import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ModeloSuela = {
  id: string
  nombre: string
  temporada: 'verano' | 'invierno'
  categoria: 'dama' | 'nino'
  descripcion?: string
  storage_path: string
  public_url: string
  created_at: string
}

export type ReporteTendencia = {
  id: string
  fecha: string
  temporada: string
  concepto_dama?: string
  concepto_nino?: string
  alerta_emergente?: string
  texto_completo?: string
  created_at: string
}
