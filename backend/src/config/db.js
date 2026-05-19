import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const DB_ROLE_MAP = {
  admin:     'rol_admin',
  vendedor:  'rol_vendedor',
  cliente:   'rol_cliente',
  bodeguero: 'rol_bodeguero',
  auditor:   'rol_auditor',
};

export async function queryWithRole(userRol, sql, params = []) {
  const dbRole = DB_ROLE_MAP[userRol];
  const client = await pool.connect();
  try {
    if (dbRole) await client.query(`SET ROLE ${dbRole}`);
    const result = await client.query(sql, params);
    return result;
  } finally {
    await client.query('RESET ROLE').catch(() => {});
    client.release();
  }
}

export default pool;