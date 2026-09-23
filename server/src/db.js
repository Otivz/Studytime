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

const isRemoteDb = Boolean(
  process.env.DB_HOST && 
  !process.env.DB_HOST.includes('localhost') && 
  process.env.DB_HOST !== '127.0.0.1'
);

const useSSL = process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true' || isRemoteDb;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'studytime_db',
  port: Number(process.env.DB_PORT) || 3306,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initDatabase() {
  try {
    const conn = await pool.getConnection();
    console.log(`Connected to MySQL database at ${process.env.DB_HOST || 'localhost'} (SSL: ${useSSL ? 'ON' : 'OFF'})`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        provider ENUM('google', 'email', 'guest') DEFAULT 'email',
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id VARCHAR(64) PRIMARY KEY,
        study_minutes INT DEFAULT 25,
        short_break_minutes INT DEFAULT 5,
        long_break_minutes INT DEFAULT 15,
        daily_goal_minutes INT DEFAULT 120,
        sound_enabled TINYINT(1) DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS daily_goals (
        user_id VARCHAR(64) PRIMARY KEY,
        target_minutes INT DEFAULT 120,
        streak_days INT DEFAULT 0,
        last_active_date VARCHAR(32) DEFAULT '',
        longest_streak INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(32) DEFAULT '#FDE68A',
        icon VARCHAR(32) DEFAULT '📚',
        sessions_count INT DEFAULT 0,
        total_minutes INT DEFAULT 0,
        goal VARCHAR(255),
        target_date VARCHAR(64),
        target_minutes INT,
        status VARCHAR(32) DEFAULT 'active',
        completed_at VARCHAR(64),
        goal_celebrated TINYINT(1) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        subject_id VARCHAR(64),
        subject_name VARCHAR(255) DEFAULT 'General Focus',
        duration_minutes INT DEFAULT 0,
        timestamp VARCHAR(64) NOT NULL,
        goal VARCHAR(255),
        notes TEXT,
        completed TINYINT(1) DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    conn.release();
    console.log('StudyTime MySQL schema verified and ready.');
  } catch (err) {
    console.error('MySQL database initialization failed:', err.message);
  }
}

export default pool;