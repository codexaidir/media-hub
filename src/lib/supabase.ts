import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || 'https://ahlsxlolacwqcbouazsn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHN4bG9sYWN3cWNib3VhenNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MzY3NjQsImV4cCI6MjEwMTMxMjc2NH0.2rdcxynhLA2RgTiX7B3SKdEfl1f5yK3Fc02b-mim_MU';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co' && supabaseAnonKey !== 'your-anon-key');

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  }

  return supabase;
}

export async function upsertUserProfile(userId: string, fullName?: string | null, avatarUrl?: string | null) {
  const client = getSupabase();

  const { data, error } = await client
    .from('profiles')
    .upsert(
      {
        id: userId,
        full_name: fullName ?? null,
        avatar_url: avatarUrl ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('id, full_name, avatar_url, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserProfile(userId: string) {
  const client = getSupabase();

  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, avatar_url, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
