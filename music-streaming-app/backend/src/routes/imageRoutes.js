const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// GET /api/images/song/:id
router.get('/song/:id', imageController.getSongImage);

// GET /api/images/artist/:nameOrId
router.get('/artist/:nameOrId', imageController.getArtistImage);

// GET /api/images/home/:name
router.get('/home/:name', imageController.getHomeImage);

// GET /api/images/drive/:driveFileId
router.get('/drive/:driveFileId', imageController.getDriveImage);

module.exports = router;

