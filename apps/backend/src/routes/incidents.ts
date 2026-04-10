import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const incidentSchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(3),
  description: z.string().min(5),
  severity: z.enum(['low', 'medium', 'high', 'critical'])
});

const statusSchema = z.object({
  status: z.enum(['open', 'investigating', 'mitigated', 'resolved'])
});

export const incidentsRouter = Router();

incidentsRouter.get('/', requireAuth, async (_req, res) => {
  const result = await pool.query(
    `SELECT
       i.id,
       i.title,
       i.description,
       i.severity,
       i.status,
       i.created_at,
       i.updated_at,
       p.name AS project_name
     FROM incidents i
     JOIN projects p ON p.id = i.project_id
     ORDER BY i.created_at DESC`
  );

  res.json({ items: result.rows });
});

incidentsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = incidentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.flatten() });
    return;
  }

  const { projectId, title, description, severity } = parsed.data;
  const createdBy = req.user?.userId;

  const result = await pool.query(
    `INSERT INTO incidents (project_id, title, description, severity, status, created_by)
     VALUES ($1, $2, $3, $4, 'open', $5)
     RETURNING id, project_id, title, description, severity, status, created_at, updated_at`,
    [projectId, title, description, severity, createdBy]
  );

  res.status(201).json(result.rows[0]);
});

incidentsRouter.patch('/:id/status', requireAuth, async (req, res) => {
  const paramsId = Number(req.params.id);
  const parsed = statusSchema.safeParse(req.body);

  if (!Number.isInteger(paramsId) || paramsId <= 0) {
    res.status(400).json({ message: 'Invalid incident id' });
    return;
  }

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.flatten() });
    return;
  }

  const result = await pool.query(
    `UPDATE incidents
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, status, updated_at`,
    [parsed.data.status, paramsId]
  );

  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Incident not found' });
    return;
  }

  res.json(result.rows[0]);
});
