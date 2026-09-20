const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', likeController.getUserLikes);
router.post('/:songId', likeController.likeSong);
router.delete('/:songId', likeController.unlikeSong);

module.exports = router;
