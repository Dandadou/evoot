import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

export type EvootEnv = {
  DB: D1Database;
};

export function getDB() {
  const { env } = getCloudflareContext();
  return (env as unknown as EvootEnv).DB;
}
