const pool = require('../config/db');
const { getImageStream, scanDriveImages } = require('../services/imageService');
const { getDriveFileStream } = require('../services/driveService');

let SONGS_META = [];
try {
  SONGS_META = require('../../../music-assets/songs.json');
} catch (e) {
  try {
    SONGS_META = require('../../../../music-assets/songs.json');
  } catch (e2) {}
}

// Initialize image scan on startup
scanDriveImages().catch(err => console.warn('Initial image scan warning:', err.message));

function generateSVGPlaceholder(title, subtitle = '', type = 'song') {
  const safeTitle = (title || (type === 'artist' ? 'Artist' : 'Song')).trim();
  const initials = safeTitle
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '♪';

  const isArtist = type === 'artist';
  const rx = isArtist ? '200' : '24';
  const startColor = isArtist ? '#4f46e5' : '#1e1b4b';
  const midColor = isArtist ? '#7c3aed' : '#312e81';
  const endColor = isArtist ? '#db2777' : '#4338ca';

  const cleanDisplayTitle = safeTitle.length > 24 ? safeTitle.substring(0, 22) + '...' : safeTitle;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${startColor}" />
        <stop offset="50%" stop-color="${midColor}" />
        <stop offset="100%" stop-color="${endColor}" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="${rx}" fill="url(#grad)" />
    <circle cx="200" cy="180" r="110" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3" />
    <text x="200" y="175" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="700">${initials}</text>
    <text x="200" y="270" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.85)" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600">${cleanDisplayTitle}</text>
  </svg>`;
}

// GET /api/images/song/:id
exports.getSongImage = async (req, res, next) => {
  try {
    const songId = req.params.id;
    let title = songId;
    let artistName = '';

    try {
      const [rows] = await pool.query(
        'SELECT s.title, s.cover_url, a.name AS artistName FROM songs s LEFT JOIN artists a ON s.artist_id = a.id WHERE s.id = ?',
        [songId]
      );
      if (rows.length > 0) {
        title = rows[0].title || songId;
        artistName = rows[0].artistName || '';
      }
    } catch (e) {
      console.warn('DB query error in getSongImage:', e.message);
    }

    // Fallback to static songs.json metadata if song ID not in DB (e.g. static songs 20..35)
    if ((title === songId || !artistName) && Array.isArray(SONGS_META)) {
      const meta = SONGS_META.find(s => String(s.id) === String(songId));
      if (meta) {
        title = meta.song_name || title;
        artistName = meta.artist_name || artistName;
      }
    }

    const cleanTitle = title.replace(/^[0-9]+\.\s*/, '').trim();

    // Priority 1: Song-specific artwork
    let imgObj = await getImageStream('song', cleanTitle);
    if (!imgObj && cleanTitle !== title) {
      imgObj = await getImageStream('song', title);
    }

    // Priority 2: Artist artwork (if song artwork missing)
    if (!imgObj && artistName) {
      imgObj = await getImageStream('artist', artistName);
      if (!imgObj && artistName.includes('-')) {
        imgObj = await getImageStream('artist', artistName.replace(/-/g, ' '));
      }
    }

    if (imgObj) {
      res.setHeader('Content-Type', imgObj.mimeType || 'image/jpeg');
      if (imgObj.size) res.setHeader('Content-Length', imgObj.size);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return imgObj.stream.pipe(res);
    }

    // Priority 3: Item-specific SVG placeholder
    console.warn('[IMAGE LOG] Song artwork and Artist artwork not found, serving SVG placeholder:', { songId, title, cleanTitle, artistName });

    const svg = generateSVGPlaceholder(cleanTitle, artistName, 'song');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    return res.status(200).send(svg);
  } catch (err) {
    next(err);
  }
};

// GET /api/images/artist/:nameOrId
exports.getArtistImage = async (req, res, next) => {
  try {
    const rawParam = req.params.nameOrId || '';
    let artistName = decodeURIComponent(rawParam).trim();

    // Resolve artist ID (numeric or string like "a0", "a1", "1", "2")
    const cleanId = artistName.replace(/\D/g, '');
    if (cleanId && /^a?\d+$/i.test(artistName)) {
      try {
        const [rows] = await pool.query('SELECT name FROM artists WHERE id = ?', [cleanId]);
        if (rows.length > 0) {
          artistName = rows[0].name;
        }
      } catch (e) {
        console.warn('Artist ID DB query error:', e.message);
      }
    }

    let imgObj = await getImageStream('artist', artistName);
    if (!imgObj && artistName.includes('-')) {
      imgObj = await getImageStream('artist', artistName.replace(/-/g, ' '));
    }
    if (!imgObj && artistName.includes('_')) {
      imgObj = await getImageStream('artist', artistName.replace(/_/g, ' '));
    }

    if (imgObj) {
      res.setHeader('Content-Type', imgObj.mimeType || 'image/jpeg');
      if (imgObj.size) res.setHeader('Content-Length', imgObj.size);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return imgObj.stream.pipe(res);
    }

    console.warn('[IMAGE LOG] Artist image not found on disk, serving SVG fallback:', { rawParam, artistName });

    const svg = generateSVGPlaceholder(artistName, '', 'artist');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    return res.status(200).send(svg);
  } catch (err) {
    next(err);
  }
};

// GET /api/images/home/:name
exports.getHomeImage = async (req, res, next) => {
  try {
    const imageName = decodeURIComponent(req.params.name || '');
    const imgObj = await getImageStream('home', imageName);

    if (imgObj) {
      res.setHeader('Content-Type', imgObj.mimeType || 'image/jpeg');
      if (imgObj.size) res.setHeader('Content-Length', imgObj.size);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return imgObj.stream.pipe(res);
    }

    console.warn('[IMAGE LOG] Home image not found on disk, serving SVG fallback:', { imageName });
    const svg = generateSVGPlaceholder(imageName, '', 'song');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    return res.status(200).send(svg);
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
      console.warn('[IMAGE LOG] Drive image fetch error:', { driveFileId, status: driveRes.status });
      const svg = generateSVGPlaceholder('Drive Asset', '', 'song');
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.status(200).send(svg);
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
