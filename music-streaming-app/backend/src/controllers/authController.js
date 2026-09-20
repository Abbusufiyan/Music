const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
function generateToken(user) {
  const payload = { userId: user.id, username: user.username };
  const secret = process.env.JWT_SECRET || 'supersecretkey';
  const expiresIn = process.env.TOKEN_EXPIRES_IN || '24h';
  return jwt.sign(payload, secret, { expiresIn });
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    // Check for duplicate email or username
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email or username already in use' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const defaultAvatar = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200&h=200';
    const [result] = await pool.query('INSERT INTO users (username, email, password, name, bio, avatar_url) VALUES (?, ?, ?, ?, ?, ?)', [username, email, hashed, username, 'Music is better when shared.', defaultAvatar]);
    const userId = result.insertId;
    const token = generateToken({ id: userId, username });
    
    const user = {
      id: userId,
      username,
      email,
      name: username,
      bio: 'Music is better when shared.',
      avatarUrl: defaultAvatar
    };

    res.status(201).json({ message: 'User registered', token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const loginId = req.body.username || req.body.email;
    const { password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [loginId, loginId]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = generateToken({ id: user.id, username: user.username });
    
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || user.username,
      bio: user.bio || 'Music is better when shared.',
      avatarUrl: user.avatar_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200&h=200'
    };

    res.json({ token, user: userData });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [users] = await pool.query('SELECT id, username, email, name, bio, avatar_url, created_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || user.username,
      bio: user.bio || 'Music is better when shared.',
      avatarUrl: user.avatar_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200&h=200'
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, bio, avatarUrl } = req.body;

    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [name !== undefined ? name : null, bio !== undefined ? bio : null, avatarUrl !== undefined ? avatarUrl : null, userId]
    );

    const [users] = await pool.query('SELECT id, username, email, name, bio, avatar_url FROM users WHERE id = ?', [userId]);
    const user = users[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || user.username,
      bio: user.bio || '',
      avatarUrl: user.avatar_url || ''
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/protected (example protected route)
exports.protected = (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
};
