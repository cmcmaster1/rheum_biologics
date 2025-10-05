import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

export const pool = new Pool({ connectionString });

export const query = (text: string, params?: unknown[]) => pool.query(text, params);
