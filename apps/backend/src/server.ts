import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { initDependencies } from './db.js';
import { metricsMiddleware, register } from './metrics.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { projectsRouter } from './routes/projects.js';
import { incidentsRouter } from './routes/incidents.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(metricsMiddleware);

app.use(healthRouter);

app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/incidents', incidentsRouter);

app.get('/api', (_req, res) => {
  res.json({
    name: 'OpsBoard API',
    version: '0.1.0'
  });
});

async function start(): Promise<void> {
  try {
    await initDependencies();
    app.listen(config.appPort, () => {
      console.log(`OpsBoard API listening on port ${config.appPort}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
