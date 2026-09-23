import express from 'express';
import pool from '../db.js';
import { authenticateToken, authorizeUser } from '../middleware/auth.js';

const router = express.Router();

function mapGoalFromDb(row) {
  return {
    targetMinutes: row.target_minutes || 120,
    streakDays: row.streak_days || 0,
    lastActiveDate: row.last_active_date || '',
    longestStreak: row.longest_streak || 0
  };
}

// 1. Get daily goals & streak for a user (Protected)
router.get('/:userId', authenticateToken, authorizeUser('userId'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM daily_goals WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.json({
        targetMinutes: 120,
        streakDays: 0,
        lastActiveDate: '',
        longestStreak: 0
      });
    }
    res.json(mapGoalFromDb(rows[0]));
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Update daily goals & streak for a user (Protected)
router.put('/:userId', authenticateToken, authorizeUser('userId'), async (req, res) => {
  const {
    targetMinutes,
    streakDays,
    lastActiveDate,
    longestStreak
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO daily_goals (
        user_id, target_minutes, streak_days, last_active_date, longest_streak
      ) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        target_minutes = COALESCE(VALUES(target_minutes), target_minutes),
        streak_days = COALESCE(VALUES(streak_days), streak_days),
        last_active_date = COALESCE(VALUES(last_active_date), last_active_date),
        longest_streak = COALESCE(VALUES(longest_streak), longest_streak)`,
      [
        req.user.id,
        targetMinutes || 120,
        streakDays || 0,
        lastActiveDate || '',
        longestStreak || 0
      ]
    );

    res.json({
      targetMinutes,
      streakDays,
      lastActiveDate,
      longestStreak
    });
  } catch (error) {
    console.error('Error updating goals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;