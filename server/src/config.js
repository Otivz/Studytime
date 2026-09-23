import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root or server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.JWT_SECRET) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}
if (!process.env.JWT_SECRET) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}
if (!process.env.JWT_SECRET) {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
}

export const JWT_SECRET = process.env.JWT_SECRET || 'studytime_super_secret_jwt_key_2026';
export const PORT = process.env.PORT || 5000;
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 3306;
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_NAME = process.env.DB_NAME || 'studytime_db';
