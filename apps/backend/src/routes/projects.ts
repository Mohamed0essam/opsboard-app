import { Router } from 'express';
import { z } from 'zod';
import { pool, redis } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const projectSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(5),
  environment: z.enum(['dev', 'staging', 'prod'])
});

export const projectsRouter = Router();

projectsRouter.get('/', requireAuth, async (_req, res) => {
  const cacheKey = 'projects:all';
  const cached = await redis.get(cacheKey);

  if (cached) {
    res.json({ source: 'cache', items: JSON.parse(cached) });
    return;
  }

  const result = await pool.query(
    `SELECT id, name, description, environment, created_at
     FROM projects
     ORDER BY created_at DESC`
  );

  await redis.set(cacheKey, JSON.stringify(result.rows), { EX: 30 });
  res.json({ source: 'db', items: result.rows });
});

projectsRouter.post('/', requireAuth, async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.flatten() });
    return;
  }

  const { name, description, environment } = parsed.data;

  const result = await pool.query(
    `INSERT INTO projects (name, description, environment)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, environment, created_at`,
    [name, description, environment]
  );

  await redis.del('projects:all');
  res.status(201).json(result.rows[0]);
});
