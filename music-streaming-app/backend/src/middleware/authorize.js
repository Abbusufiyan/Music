const pool = require('../config/db');

/**
 * Authorization Middleware
 * Verifies resource ownership before allowing mutation operations.
 */

// Verify ownership of a playlist by ID (req.params.id)
async function verifyPlaylistOwnership(req, res, next) {
  try {
    const userId = req.user && (req.user.userId || req.user.id);
    const playlistId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!playlistId) {
      return res.status(400).json({
        success: false,
        error: 'Playlist ID parameter is required'
      });
    }

    const [rows] = await pool.query('SELECT * FROM playlists WHERE id = ?', [playlistId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    const playlist = rows[0];

    // Check ownership
    if (String(playlist.user_id) !== String(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not authorized to modify this playlist'
      });
    }

    req.playlist = playlist;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  verifyPlaylistOwnership
};
