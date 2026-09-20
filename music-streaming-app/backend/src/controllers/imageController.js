const pool = require('../config/db');
const { getImageStream, scanDriveImages } = require('../services/imageService');
const { getDriveFileStream } = require('../services/driveService');

// Initialize image scan on startup
scanDriveImages().catch(err => console.warn('Initial image scan warning:', err.message));

// GET /api/images/song/:id
exports.getSongImage = async (req, res, next) => {
  try {
    const songId = req.params.id;
    const [rows] = await pool.query(
      'SELECT s.title, s.cover_url, a.name AS artistName FROM songs s LEFT JOIN artists a ON s.artist_id = a.id WHERE s.id = ?',
      [songId]
    );

    const title = rows[0]?.title || songId;
    const artistName = rows[0]?.artistName || '';

    let imgObj = await getImageStream('song', title);

    if (!imgObj && rows[0]?.cover_url && !rows[0].cover_url.startsWith('http') && !rows[0].cover_url.startsWith('/api')) {
      imgObj = await getImageStream('song', rows[0].cover_url);
    }

    if (!imgObj && (artistName.toLowerCase().includes('nusrat') || artistName.toLowerCase().includes('nfak') || (parseInt(songId, 10) >= 35 && parseInt(songId, 10) <= 50))) {
      imgObj = await getImageStream('artist', songId);
    }

    if (!imgObj) {
      // Fallback default artwork image
      return res.redirect('https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=400&fit=crop');
    }

    res.setHeader('Content-Type', imgObj.mimeType || 'image/jpeg');
    if (imgObj.size) res.setHeader('Content-Length', imgObj.size);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    return imgObj.stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

// GET /api/images/artist/:nameOrId
exports.getArtistImage = async (req, res, next) => {
  try {
    let artistName = req.params.nameOrId;

    if (/^\d+$/.test(artistName)) {
      const [rows] = await pool.query('SELECT name FROM artists WHERE id = ?', [artistName]);
      if (rows.length > 0) artistName = rows[0].name;
    }

    const imgObj = await getImageStream('artist', artistName);

    if (!imgObj) {
      // Fallback default artist avatar
      return res.redirect('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop');
    }

    res.setHeader('Content-Type', imgObj.mimeType || 'image/jpeg');
    if (imgObj.size) res.setHeader('Content-Length', imgObj.size);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    return imgObj.stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

// GET /api/images/home/:name
exports.getHomeImage = async (req, res, next) => {
  try {
    const imageName = req.params.name;
    const imgObj = await getImageStream('home', imageName);

    if (!imgObj) {
      return res.redirect('https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&h=600&fit=crop');
    }

    res.setHeader('Content-Type', imgObj.mimeType || 'image/jpeg');
    if (imgObj.size) res.setHeader('Content-Length', imgObj.size);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    return imgObj.stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

// GET /api/images/drive/:driveFileId
exports.getDriveImage = async (req, res, next) => {
  try {
    const driveFileId = req.params.driveFileId;
    const driveRes = await getDriveFileStream(driveFileId);

    if (driveRes.status >= 400) {
      return res.status(driveRes.status).json({ error: 'Failed to retrieve image from Google Drive' });
    }

    const contentType = driveRes.headers?.['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    if (driveRes.headers?.['content-length']) res.setHeader('Content-Length', driveRes.headers['content-length']);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    return driveRes.stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

