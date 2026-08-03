import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { STORAGE_BUCKET_NAME } from './supabase';

const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is required for Supabase admin operations.');
}

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for Supabase admin operations.');
}

export const adminSupabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function ensureStorageBucket(bucketName: string = STORAGE_BUCKET_NAME) {
  const { data: bucket, error } = await adminSupabase.storage.getBucket(bucketName);
  if (error && error.status === 404) {
    const { error: createError } = await adminSupabase.storage.createBucket(bucketName, {
      public: false,
    });
    if (createError) {
      throw createError;
    }
  } else if (error) {
    throw error;
  }

  return bucket;
}
