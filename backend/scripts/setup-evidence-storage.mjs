import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const bucket = process.env.EVIDENCE_BUCKET || 'learner-evidence';
const allowedMimeTypes = ['application/zip', 'application/x-zip-compressed', 'text/plain', 'application/json'];

if (!url || !secretKey?.startsWith('sb_secret_')) {
  console.error('Evidence Storage setup requires SUPABASE_URL and a server-only SUPABASE_SECRET_KEY.');
  process.exit(1);
}

const client = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const configuration = { public: false, fileSizeLimit: 6 * 1024 * 1024, allowedMimeTypes };
const existing = await client.storage.getBucket(bucket);

if (existing.error && existing.error.message !== 'Bucket not found') {
  console.error('Evidence Storage inspection failed.');
  process.exit(1);
}

const operation = existing.data
  ? await client.storage.updateBucket(bucket, configuration)
  : await client.storage.createBucket(bucket, configuration);

if (operation.error) {
  console.error('Evidence Storage configuration failed.');
  process.exit(1);
}

const verification = await client.storage.getBucket(bucket);
if (verification.error || !verification.data || verification.data.public !== false) {
  console.error('Evidence Storage verification failed.');
  process.exit(1);
}

console.log(JSON.stringify({ bucket: verification.data.name, public: verification.data.public, configured: true }, null, 2));
