import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;