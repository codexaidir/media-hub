import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim() || 'https://ahlsxlolacwqcbouazsn.supabase.co';
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHN4bG9sYWN3cWNib3VhenNuIiwicm9sZSI6ImFob24iLCJpYXQiOjE3ODU3MzY3NjQsImV4cCI6MjEwMTMxMjc2NH0.2rdcxynhLA2RgTiX7B3SKdEfl1f5yK3Fc02b-mim_MU';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co' && supabaseAnonKey !== 'your-anon-key');
export const STORAGE_BUCKET_NAME = 'user-media-outputs';

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

export async function saveUserSearch(userId: string, url: string, resultCount: number) {
  const client = getSupabase();
  const { data, error } = await client
    .from('searches')
    .insert({
      user_id: userId,
      url,
      result_count: resultCount,
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveMediaOutput({
  userId,
  searchId,
  bucket = STORAGE_BUCKET_NAME,
  storagePath,
  filename,
  mimeType,
  sizeBytes,
  metadata,
}: {
  userId: string;
  searchId?: string | null;
  bucket?: string;
  storagePath: string;
  filename: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  metadata?: Record<string, unknown>;
}) {
  const client = getSupabase();
  const { data, error } = await client
    .from('media_outputs')
    .insert({
      user_id: userId,
      search_id: searchId,
      bucket,
      storage_path: storagePath,
      filename,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      metadata: metadata ?? {},
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
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
