const pool = require('../config/db');

// GET /api/likes
exports.getUserLikes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [rows] = await pool.query('SELECT song_id FROM likes WHERE user_id = ?', [userId]);
    const likedSongIds = rows.map(r => String(r.song_id));
    res.json(likedSongIds);
  } catch (err) {
    next(err);
  }
};

// POST /api/likes/:songId
exports.likeSong = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { songId } = req.params;
    await pool.query('INSERT IGNORE INTO likes (user_id, song_id) VALUES (?, ?)', [userId, songId]);
    res.json({ message: 'Song liked' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/likes/:songId
exports.unlikeSong = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { songId } = req.params;
    await pool.query('DELETE FROM likes WHERE user_id = ? AND song_id = ?', [userId, songId]);
    res.json({ message: 'Song unliked' });
  } catch (err) {
    next(err);
  }
};
