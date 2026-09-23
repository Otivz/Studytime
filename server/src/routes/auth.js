import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import pool from '../db.js';

import { JWT_SECRET } from '../config.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to seed defaults for a new user
async function seedUserData(userId, userName) {
  const today = new Date().toISOString().split('T')[0];

  // 1. Default settings
  await pool.query(
    `INSERT IGNORE INTO settings (user_id, study_minutes, short_break_minutes, long_break_minutes, daily_goal_minutes, sound_enabled)
     VALUES (?, 25, 5, 15, 120, 1)`,
    [userId]
  );

  // 2. Default daily goals
  await pool.query(
    `INSERT IGNORE INTO daily_goals (user_id, target_minutes, streak_days, last_active_date, longest_streak)
     VALUES (?, 120, 1, ?, 1)`,
    [userId, today]
  );

  // Users start with no subjects — they add their own
}

// 1. Register with Email & Password
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `usr-${randomUUID().slice(0, 12)}`;
    const formattedName = name?.trim() || email.split('@')[0];

    await pool.query(
      `INSERT INTO users (id, email, name, avatar_url, provider, password_hash)
       VALUES (?, ?, ?, NULL, 'email', ?)`,
      [userId, email.trim().toLowerCase(), formattedName, passwordHash]
    );

    // Seed default settings and subjects
    await seedUserData(userId, formattedName);

    const user = {
      id: userId,
      name: formattedName,
      email: email.trim().toLowerCase(),
      avatar: '👤',
      provider: 'email',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// 2. Login with Email & Password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const dbUser = rows[0];

    if (!dbUser.password_hash) {
      return res.status(400).json({ error: 'This account was created with Google. Please continue with Google.' });
    }

    const isMatch = await bcrypt.compare(password, dbUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.avatar_url || '👤',
      provider: dbUser.provider || 'email',
      joinedDate: new Date(dbUser.created_at).toISOString().split('T')[0]
    };

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// 3. Google Sign-In / OAuth
router.post('/google', async (req, res) => {
  try {
    const { credential, email: mockEmail, name: mockName, avatar: mockAvatar } = req.body;

    let email = mockEmail;
    let name = mockName;
    let avatar = mockAvatar;

    // Decode Google ID Token (JWT) if credential string provided
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadStr);
          email = payload.email;
          name = payload.name;
          avatar = payload.picture;
        }
      } catch (err) {
        console.warn('Failed to parse Google credential payload, falling back to body fields', err);
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Could not extract email from Google Sign-In' });
    }

    email = email.trim().toLowerCase();
    name = name?.trim() || email.split('@')[0];

    // Check if user already exists
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let userId;
    let joinedDate = new Date().toISOString().split('T')[0];

    if (existing.length > 0) {
      userId = existing[0].id;
      joinedDate = new Date(existing[0].created_at).toISOString().split('T')[0];
      // Update avatar if provided
      if (avatar) {
        await pool.query('UPDATE users SET avatar_url = ?, name = ? WHERE id = ?', [avatar, name, userId]);
      }
    } else {
      // Create new Google user
      userId = `usr-google-${randomUUID().slice(0, 10)}`;
      await pool.query(
        `INSERT INTO users (id, email, name, avatar_url, provider)
         VALUES (?, ?, ?, ?, 'google')`,
        [userId, email, name, avatar || null]
      );
      // Seed starter data
      await seedUserData(userId, name);
    }

    const user = {
      id: userId,
      name,
      email,
      avatar: avatar || '👤',
      provider: 'google',
      joinedDate
    };

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ user, token });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// 4. Guest / Demo Login
router.post('/guest', async (req, res) => {
  try {
    const guestId = `usr-guest-${randomUUID().slice(0, 8)}`;
    const guestUser = {
      id: guestId,
      name: 'Guest User',
      email: `guest-${guestId.slice(-4)}@studytime.local`,
      avatar: '✎',
      provider: 'guest',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    // Save guest to DB for consistent foreign keys
    await pool.query(
      `INSERT INTO users (id, email, name, avatar_url, provider)
       VALUES (?, ?, ?, NULL, 'guest')`,
      [guestUser.id, guestUser.email, guestUser.name]
    );

    await seedUserData(guestUser.id, guestUser.name);

    const token = jwt.sign({ id: guestUser.id, email: guestUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: guestUser, token });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ error: 'Failed to initialize guest session' });
  }
});

// 5. Get Current User profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, name, avatar_url, provider, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const dbUser = rows[0];
    res.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        avatar: dbUser.avatar_url || '👤',
        provider: dbUser.provider,
        joinedDate: new Date(dbUser.created_at).toISOString().split('T')[0]
      }
    });
  } catch (err) {
    console.error('Error in /me:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
