const express = require('express');
const router = express.Router();

// Import feature routes
const authRoutes = require('./authRoutes');
const songRoutes = require('./songRoutes');
const playlistRoutes = require('./playlistRoutes');
const likeRoutes = require('./likeRoutes');
const activityRoutes = require('./activityRoutes');
const imageRoutes = require('./imageRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount feature routers
router.use('/auth', authRoutes);
router.use('/songs', songRoutes);
router.use('/playlists', playlistRoutes);
router.use('/likes', likeRoutes);
router.use('/activities', activityRoutes);
router.use('/images', imageRoutes);

module.exports = router;
