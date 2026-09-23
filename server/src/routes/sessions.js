import express from 'express';
import pool from '../db.js';
import { authenticateToken, authorizeUser } from '../middleware/auth.js';

const router = express.Router();

function mapSessionFromDb(row) {
  return {
    id: row.id,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    durationMinutes: row.duration_minutes || 0,
    timestamp: row.timestamp,
    goal: row.goal || undefined,
    notes: row.notes || undefined,
    completed: Boolean(row.completed)
  };
}

// 1. Get all sessions for a user (Protected)
router.get('/:userId', authenticateToken, authorizeUser('userId'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sessions WHERE user_id = ? ORDER BY timestamp DESC',
      [req.user.id]
    );
    res.json(rows.map(mapSessionFromDb));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Create a session record (Protected)
router.post('/', authenticateToken, async (req, res) => {
  const {
    id,
    subjectId,
    subjectName,
    durationMinutes,
    timestamp,
    goal,
    notes,
    completed
  } = req.body;

  const userId = req.user.id;
  const sessionId = id || `sess-${Date.now()}`;
  const recordTimestamp = timestamp || new Date().toISOString();

  try {
    await pool.query(
      `INSERT INTO sessions (
        id, user_id, subject_id, subject_name, duration_minutes, timestamp, goal, notes, completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        userId,
        subjectId || null,
        subjectName || 'General Focus',
        durationMinutes || 0,
        recordTimestamp,
        goal || null,
        notes || null,
        completed !== undefined ? (completed ? 1 : 0) : 1
      ]
    );

    res.status(201).json({
      id: sessionId,
      subjectId,
      subjectName: subjectName || 'General Focus',
      durationMinutes: durationMinutes || 0,
      timestamp: recordTimestamp,
      goal,
      notes,
      completed: completed !== undefined ? completed : true
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Delete a specific session (Protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM sessions WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Clear all sessions for a user (Protected)
router.delete('/user/:userId', authenticateToken, authorizeUser('userId'), async (req, res) => {
  try {
    await pool.query('DELETE FROM sessions WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'All sessions deleted' });
  } catch (error) {
    console.error('Error clearing sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;