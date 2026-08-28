import { getCloudflareContext } from '@opennextjs/cloudflare';

export type EvootEnv = {
  DB: D1Database;
};

export function getDB() {
  const { env } = getCloudflareContext();
  return (env as unknown as EvootEnv).DB;
}
