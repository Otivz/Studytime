import express from 'express';
import pool from '../db.js';
import { authenticateToken, authorizeUser } from '../middleware/auth.js';

const router = express.Router();

// Helper to map DB row to frontend Subject object
function mapSubjectFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    sessionsCount: row.sessions_count || 0,
    totalMinutes: row.total_minutes || 0,
    goal: row.goal || undefined,
    targetDate: row.target_date || undefined,
    targetMinutes: row.target_minutes || undefined,
    status: row.status || 'active',
    completedAt: row.completed_at || undefined,
    goalCelebrated: Boolean(row.goal_celebrated)
  };
}

// 1. Get all subjects for a user (Protected)
router.get('/:userId', authenticateToken, authorizeUser('userId'), async (req, res) => {
  try {
    let rows;
    try {
      [rows] = await pool.query(
        'SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at ASC',
        [req.user.id]
      );
    } catch {
      [rows] = await pool.query(
        'SELECT * FROM subjects WHERE user_id = ? ORDER BY id ASC',
        [req.user.id]
      );
    }
    res.json(rows.map(mapSubjectFromDb));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Create a new subject (Protected)
router.post('/', authenticateToken, async (req, res) => {
  const {
    id,
    name,
    color,
    icon,
    sessionsCount,
    totalMinutes,
    goal,
    targetDate,
    targetMinutes,
    status,
    completedAt,
    goalCelebrated
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Subject name is required' });
  }

  const userId = req.user.id;
  const subjectId = id || `sub-${Date.now()}`;

  try {
    await pool.query(
      `INSERT INTO subjects (
        id, user_id, name, color, icon, sessions_count, total_minutes, 
        goal, target_date, target_minutes, status, completed_at, goal_celebrated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subjectId,
        userId,
        name,
        color || '#FDE68A',
        icon || '📚',
        sessionsCount || 0,
        totalMinutes || 0,
        goal || null,
        targetDate || null,
        targetMinutes || null,
        status || 'active',
        completedAt || null,
        goalCelebrated ? 1 : 0
      ]
    );

    res.status(201).json({
      id: subjectId,
      name,
      color: color || '#FDE68A',
      icon: icon || '📚',
      sessionsCount: sessionsCount || 0,
      totalMinutes: totalMinutes || 0,
      goal,
      targetDate,
      targetMinutes,
      status: status || 'active',
      completedAt,
      goalCelebrated: Boolean(goalCelebrated)
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Update an existing subject (Protected)
router.put('/:id', authenticateToken, async (req, res) => {
  const {
    name,
    color,
    icon,
    sessionsCount,
    totalMinutes,
    goal,
    targetDate,
    targetMinutes,
    status,
    completedAt,
    goalCelebrated
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE subjects SET 
        name = COALESCE(?, name),
        color = COALESCE(?, color),
        icon = COALESCE(?, icon),
        sessions_count = COALESCE(?, sessions_count),
        total_minutes = COALESCE(?, total_minutes),
        goal = ?,
        target_date = ?,
        target_minutes = ?,
        status = COALESCE(?, status),
        completed_at = ?,
        goal_celebrated = COALESCE(?, goal_celebrated)
      WHERE id = ? AND user_id = ?`,
      [
        name,
        color,
        icon,
        sessionsCount,
        totalMinutes,
        goal !== undefined ? goal : null,
        targetDate !== undefined ? targetDate : null,
        targetMinutes !== undefined ? targetMinutes : null,
        status,
        completedAt !== undefined ? completedAt : null,
        goalCelebrated !== undefined ? (goalCelebrated ? 1 : 0) : null,
        req.params.id,
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subject not found or unauthorized' });
    }

    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Delete a subject (Protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM subjects WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subject not found or unauthorized' });
    }

    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;