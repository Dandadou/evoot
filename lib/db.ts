import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

export type EvootEnv = {
  DB: D1Database;
  UPLOADS: R2Bucket;
};

export function getDB() {
  const { env } = getCloudflareContext();
  return (env as unknown as EvootEnv).DB;
}

export function getUploadsBucket() {
  const { env } = getCloudflareContext();
  const bucket=(env as unknown as EvootEnv).UPLOADS;
  if(!bucket) throw new Error('UPLOADS_BUCKET_NOT_CONFIGURED');
  return bucket;
}
