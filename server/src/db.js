import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root or server dir
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.DB_NAME) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}
if (!process.env.DB_NAME) {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'studytime_db',
  port: Number(process.env.DB_PORT) || 3306,

  ssl: process.env.NODE_ENV === 'production'
    ? {
      rejectUnauthorized: false
    }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;