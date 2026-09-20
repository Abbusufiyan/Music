const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { authenticateToken } = require('../middleware/auth');
const { verifyPlaylistOwnership } = require('../middleware/authorize');
const { validatePlaylist, validatePlaylistSong } = require('../middleware/validate');

// Require authentication for all playlist endpoints
router.use(authenticateToken);

// GET user playlists
router.get('/', playlistController.getUserPlaylists);

// POST create playlist (Validate input)
router.post('/', validatePlaylist, playlistController.createPlaylist);

// PUT update playlist (Verify playlist ownership & validate input)
router.put('/:id', verifyPlaylistOwnership, validatePlaylist, playlistController.updatePlaylist);

// DELETE playlist (Verify playlist ownership)
router.delete('/:id', verifyPlaylistOwnership, playlistController.deletePlaylist);

// POST add song to playlist (Verify playlist ownership & validate songId input)
router.post('/:id/songs', verifyPlaylistOwnership, validatePlaylistSong, playlistController.addSongToPlaylist);

// DELETE remove song from playlist (Verify playlist ownership)
router.delete('/:id/songs/:songId', verifyPlaylistOwnership, playlistController.removeSongFromPlaylist);

module.exports = router;
