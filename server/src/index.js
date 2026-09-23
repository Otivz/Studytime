import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import subjectsRoutes from './routes/subjects.js';
import sessionsRoutes from './routes/sessions.js';
import settingsRoutes from './routes/settings.js';
import goalsRoutes from './routes/goals.js';

import { PORT } from './config.js';
import { initDatabase } from './db.js';

const app = express();

app.use(cors({
  origin: true, // Allow frontend dev ports (5173, 5174, etc.)
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/goals', goalsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'StudyTime API is running', timestamp: new Date().toISOString() });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../dist');

// Serve static frontend build if present
import fs from 'fs';
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, async () => {
  console.log(`StudyTime backend listening on http://localhost:${PORT}`);
  await initDatabase();
});