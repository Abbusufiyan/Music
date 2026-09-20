const pool = require('../config/db');

// GET /api/playlists
exports.getUserPlaylists = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [playlists] = await pool.query('SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    for (const pl of playlists) {
      pl.id = String(pl.id);
      const [songs] = await pool.query('SELECT song_id FROM playlist_songs WHERE playlist_id = ?', [pl.id]);
      pl.songIds = songs.map(s => String(s.song_id));
    }

    res.json(playlists);
  } catch (err) {
    next(err);
  }
};

// POST /api/playlists
exports.createPlaylist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO playlists (name, description, user_id) VALUES (?, ?, ?)',
      [name, description || '', userId]
    );

    const newPlaylist = {
      id: String(result.insertId),
      name,
      description: description || '',
      userId,
      songIds: []
    };

    res.status(201).json(newPlaylist);
  } catch (err) {
    next(err);
  }
};

// PUT /api/playlists/:id
exports.updatePlaylist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, description } = req.body;

    const [existing] = await pool.query('SELECT * FROM playlists WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    await pool.query('UPDATE playlists SET name = ?, description = ? WHERE id = ? AND user_id = ?', [name, description, id, userId]);

    res.json({ message: 'Playlist updated successfully' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/playlists/:id
exports.deletePlaylist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM playlists WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    await pool.query('DELETE FROM playlists WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Playlist deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/playlists/:id/songs
exports.addSongToPlaylist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { songId } = req.body;

    const [existing] = await pool.query('SELECT * FROM playlists WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    await pool.query('INSERT IGNORE INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)', [id, songId]);
    res.json({ message: 'Song added to playlist' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/playlists/:id/songs/:songId
exports.removeSongFromPlaylist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id, songId } = req.params;

    const [existing] = await pool.query('SELECT * FROM playlists WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    await pool.query('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?', [id, songId]);
    res.json({ message: 'Song removed from playlist' });
  } catch (err) {
    next(err);
  }
};
