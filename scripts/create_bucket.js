import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.STORAGE_BUCKET_NAME || 'user-media-outputs';

if (!supabaseUrl || !serviceRole) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

async function ensure() {
  try {
    const { data: bucket, error: getErr } = await admin.storage.getBucket(bucketName);
    if (getErr && getErr.status === 404) {
      const { error: createErr } = await admin.storage.createBucket(bucketName, { public: false });
      if (createErr) {
        console.error('createBucket error', createErr.message || createErr);
        process.exit(1);
      }
      console.log('Bucket created');
      return;
    }
    if (getErr) {
      console.error('getBucket error', getErr.message || getErr);
      process.exit(1);
    }
    console.log('Bucket exists');
  } catch (err) {
    console.error('Unexpected error', err);
    process.exit(1);
  }
}

ensure();
