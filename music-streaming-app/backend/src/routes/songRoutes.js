const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

// GET /api/songs
router.get('/', songController.getAllSongs);

// GET /api/songs/search (must be before /:id)
router.get('/search', songController.searchSongs);

// GET /api/songs/:id
router.get('/:id', songController.getSongById);

// GET /api/songs/:id/stream
router.get('/:id/stream', songController.streamSong);

module.exports = router;

