import pg from 'pg';
import { createClient } from 'redis';
import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl
});

export const redis = createClient({
  url: config.redisUrl
});

let redisReady = false;

export async function initDependencies(): Promise<void> {
  await pool.query('SELECT 1');
  if (!redis.isOpen) {
    await redis.connect();
  }
  redisReady = true;
}

export function isRedisReady(): boolean {
  return redisReady;
}
