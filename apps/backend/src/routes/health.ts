import { Router } from 'express';
import { pool, isRedisReady } from '../db.js';

export const healthRouter = Router();

healthRouter.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

healthRouter.get('/readyz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    if (!isRedisReady()) {
      throw new Error('Redis not ready');
    }
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({
      status: 'not-ready',
      error: error instanceof Error ? error.message : 'unknown'
    });
  }
});
