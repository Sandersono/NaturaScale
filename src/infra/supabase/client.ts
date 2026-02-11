import { createClient } from '@supabase/supabase-js';

// Estas variáveis devem estar no .env.local
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Key não encontrados. O sistema funcionará em modo Mock ou falhará.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);