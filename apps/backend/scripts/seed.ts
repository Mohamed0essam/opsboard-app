import bcrypt from 'bcryptjs';
import { pool } from '../src/db.js';

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(process.env.DEMO_ADMIN_PASSWORD ?? 'ChangeMe123!', 10);

  await pool.query(
    `INSERT INTO users (email, full_name, password_hash, role)
     VALUES ('admin@opsboard.local', 'OpsBoard Admin', $1, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [passwordHash]
  );

  await pool.query(
    `INSERT INTO projects (name, description, environment)
     VALUES
       ('customer-api', 'Handles customer profile traffic', 'prod'),
       ('payments-gateway', 'Processes checkout requests', 'staging')
     ON CONFLICT DO NOTHING`
  );

  console.log('Seed completed');
  await pool.end();
}

main().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
