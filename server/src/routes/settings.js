import express from 'express';
import pool from '../db.js';
import { authenticateToken, authorizeUser } from '../middleware/auth.js';

const router = express.Router();

function mapSettingsFromDb(row) {
  return {
    studyMinutes: row.study_minutes || 25,
    shortBreakMinutes: row.short_break_minutes || 5,
    longBreakMinutes: row.long_break_minutes || 15,
    dailyGoalMinutes: row.daily_goal_minutes || 120,
    soundEnabled: Boolean(row.sound_enabled)
  };
}

// 1. Get settings for a user (Protected)
router.get('/:userId', authenticateToken, authorizeUser('userId'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.json({
        studyMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        dailyGoalMinutes: 120,
        soundEnabled: true
      });
    }
    res.json(mapSettingsFromDb(rows[0]));
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Update settings for a user (Protected)
router.put('/:userId', authenticateToken, authorizeUser('userId'), async (req, res) => {
  const {
    studyMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    dailyGoalMinutes,
    soundEnabled
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO settings (
        user_id, study_minutes, short_break_minutes, long_break_minutes, daily_goal_minutes, sound_enabled
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        study_minutes = VALUES(study_minutes),
        short_break_minutes = VALUES(short_break_minutes),
        long_break_minutes = VALUES(long_break_minutes),
        daily_goal_minutes = VALUES(daily_goal_minutes),
        sound_enabled = VALUES(sound_enabled)`,
      [
        req.user.id,
        studyMinutes || 25,
        shortBreakMinutes || 5,
        longBreakMinutes || 15,
        dailyGoalMinutes || 120,
        soundEnabled !== undefined ? (soundEnabled ? 1 : 0) : 1
      ]
    );

    res.json({
      studyMinutes,
      shortBreakMinutes,
      longBreakMinutes,
      dailyGoalMinutes,
      soundEnabled
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;