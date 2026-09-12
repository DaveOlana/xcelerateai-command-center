import { createHash, randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface InspectedEvidenceObject { byteSize: number; mimeType: string; sha256: string }
export interface EvidenceStorage {
  createUploadAuthorization(objectKey: string): Promise<{ path: string; token: string; expiresAt: string }>;
  inspect(objectKey: string, declaredMimeType: string): Promise<InspectedEvidenceObject>;
  createDownloadUrl(objectKey: string): Promise<{ url: string; expiresAt: string }>;
  remove(objectKey: string): Promise<void>;
}

export class SupabaseEvidenceStorage implements EvidenceStorage {
  private readonly client: SupabaseClient;

  constructor(url: string, secretKey: string, private readonly bucket: string) {
    this.client = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  }

  async createUploadAuthorization(objectKey: string) {
    const { data, error } = await this.client.storage.from(this.bucket).createSignedUploadUrl(objectKey, { upsert: false });
    if (error || !data?.token) throw new Error('Evidence upload authorization unavailable.');
    return { path: data.path, token: data.token, expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() };
  }

  async inspect(objectKey: string, declaredMimeType: string) {
    const { data, error } = await this.client.storage.from(this.bucket).download(objectKey);
    if (error || !data) throw new Error('Evidence object is unavailable.');
    const bytes = Buffer.from(await data.arrayBuffer());
    return { byteSize: bytes.byteLength, mimeType: detectMime(bytes, declaredMimeType), sha256: createHash('sha256').update(bytes).digest('hex') };
  }

  async createDownloadUrl(objectKey: string) {
    const { data, error } = await this.client.storage.from(this.bucket).createSignedUrl(objectKey, 60, { download: true });
    if (error || !data?.signedUrl) throw new Error('Evidence download authorization unavailable.');
    return { url: data.signedUrl, expiresAt: new Date(Date.now() + 60_000).toISOString() };
  }

  async remove(objectKey: string) {
    const { error } = await this.client.storage.from(this.bucket).remove([objectKey]);
    if (error) throw new Error('Evidence object removal failed.');
  }
}

export function evidenceObjectKey(userId: string, extension: string): string {
  return `v1/${userId}/${randomUUID()}/${randomUUID()}.${extension}`;
}

export function extensionFor(filename: string, mimeType: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  const allowed = mimeType.includes('zip') ? ['zip'] : mimeType === 'application/json' ? ['json'] : ['txt', 'md', 'log'];
  if (!extension || !allowed.includes(extension)) throw new Error('Filename extension does not match the declared file type.');
  return extension;
}

function detectMime(bytes: Buffer, declared: string): string {
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && [0x03, 0x05, 0x07].includes(bytes[2] ?? -1) && [0x04, 0x06, 0x08].includes(bytes[3] ?? -1)) return 'application/zip';
  if (declared === 'application/zip' || declared === 'application/x-zip-compressed') return 'application/octet-stream';
  const text = bytes.toString('utf8');
  if (Buffer.from(text, 'utf8').compare(bytes) !== 0 || text.includes('\u0000')) return 'application/octet-stream';
  if (declared === 'application/json') {
    try { JSON.parse(text); return 'application/json'; } catch { return 'text/plain'; }
  }
  return 'text/plain';
}
