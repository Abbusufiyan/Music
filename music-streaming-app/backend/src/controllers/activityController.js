const pool = require('../config/db');

// GET /api/activities
exports.getUserActivities = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [rows] = await pool.query(
      'SELECT id, message, image, UNIX_TIMESTAMP(created_at) * 1000 AS timestamp FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    res.json(rows.map(r => ({ id: `act-${r.id}`, message: r.message, image: r.image, timestamp: r.timestamp })));
  } catch (err) {
    next(err);
  }
};

// POST /api/activities
exports.addActivity = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { message, image } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO activities (user_id, message, image) VALUES (?, ?, ?)',
      [userId, message, image || null]
    );

    res.status(201).json({
      id: `act-${result.insertId}`,
      message,
      image,
      timestamp: Date.now()
    });
  } catch (err) {
    next(err);
  }
};
