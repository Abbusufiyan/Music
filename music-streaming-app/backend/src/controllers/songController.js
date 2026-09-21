const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { getDriveFileStream } = require('../services/driveService');

const SELECT_SONG_SQL = `
  SELECT 
    s.id, 
    s.title, 
    s.duration, 
    s.audio_url AS audioUrl, 
    s.cover_url AS artwork, 
    a.name AS artist, 
    s.artist_id AS artistId, 
    s.album_id AS albumId, 
    al.name AS albumName,
    s.drive_file_id AS driveFileId
  FROM songs s
  LEFT JOIN artists a ON s.artist_id = a.id
  LEFT JOIN albums al ON s.album_id = al.id
`;

// Helper to format song object for client
function formatSong(song) {
  if (!song) return song;
  let audioUrl = song.audioUrl;

  // Format stream endpoint for client audio tag playback
  audioUrl = `/api/songs/${song.id}/stream`;

  return {
    ...song,
    id: String(song.id),
    artwork: `/api/images/song/${song.id}`,
    audioUrl,
  };
}

// GET /api/songs
exports.getAllSongs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(`${SELECT_SONG_SQL} ORDER BY s.id ASC LIMIT ? OFFSET ?`, [limit, offset]);
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM songs');
    const total = countResult[0].total;

    const formattedData = rows.map(formatSong);

    res.json({ total, page, limit, data: formattedData });
  } catch (err) {
    next(err);
  }
};

// GET /api/songs/:id
exports.getSongById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${SELECT_SONG_SQL} WHERE s.id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Song not found' });
    res.json(formatSong(rows[0]));
  } catch (err) {
    next(err);
  }
};

// GET /api/songs/search?q=...
exports.searchSongs = async (req, res, next) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const [rows] = await pool.query(
      `${SELECT_SONG_SQL} WHERE s.title LIKE ? OR a.name LIKE ? OR al.name LIKE ?`,
      [q, q, q]
    );
    res.json(rows.map(formatSong));
  } catch (err) {
    next(err);
  }
};

// GET /api/songs/:id/stream
exports.streamSong = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT audio_url, drive_file_id FROM songs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Song not found' });
    
    const { audio_url: audioUrl, drive_file_id: driveFileId } = rows[0];

    // 1. If drive_file_id is set, stream directly from Google Drive API
    if (driveFileId) {
      try {
        const driveRes = await getDriveFileStream(driveFileId, req.headers);
        if (driveRes.status >= 400) {
          console.warn(`Drive API returned error status ${driveRes.status} for file ${driveFileId}`);
          return res.status(driveRes.status).json({ error: 'Failed to retrieve audio stream from Google Drive' });
        }

        res.status(driveRes.status || 200);

        const headersToPass = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
        headersToPass.forEach(h => {
          const val = driveRes.headers?.[h] || (typeof driveRes.headers?.get === 'function' ? driveRes.headers.get(h) : null);
          if (val) {
            res.setHeader(h, val);
          }
        });

        if (!res.getHeader('content-type')) {
          res.setHeader('Content-Type', 'audio/mpeg');
        }
        if (!res.getHeader('accept-ranges')) {
          res.setHeader('Accept-Ranges', 'bytes');
        }

        return driveRes.stream.pipe(res);
      } catch (driveErr) {
        console.warn(`Drive API streaming failed for file ${driveFileId}:`, driveErr.message);
      }
    }

    // 2. If audioUrl is an external HTTP/HTTPS URL, redirect to it
    if (audioUrl && (audioUrl.startsWith('http://') || audioUrl.startsWith('https://'))) {
      return res.redirect(audioUrl);
    }

    // 3. Fallback map for demo/seed audio sources
    const fallbackAudioMap = {
      '1': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      '2': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      '3': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      '4': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      '5': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      '6': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      '7': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      '8': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      '9': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      '10': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      '11': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
      '12': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
      '13': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
      '14': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
      '15': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    };

    const songId = String(req.params.id);
    if (fallbackAudioMap[songId]) {
      const fallbackUrl = fallbackAudioMap[songId];
      return new Promise((resolve) => {
        https.get(fallbackUrl, (targetRes) => {
          res.status(targetRes.statusCode || 200);
          res.setHeader('Content-Type', targetRes.headers['content-type'] || 'audio/mpeg');
          if (targetRes.headers['content-length']) res.setHeader('Content-Length', targetRes.headers['content-length']);
          res.setHeader('Accept-Ranges', 'bytes');
          targetRes.pipe(res);
          resolve();
        }).on('error', () => {
          res.status(500).json({ error: 'Fallback audio stream failed' });
          resolve();
        });
      });
    }

    // 4. Local audio file in backend/songs folder
    if (audioUrl) {
      const audioPath = path.join(__dirname, '../../songs', audioUrl);
      if (fs.existsSync(audioPath)) {
        const stat = fs.statSync(audioPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = end - start + 1;
          const file = fs.createReadStream(audioPath, { start, end });
          const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'audio/mpeg',
          };
          res.writeHead(206, head);
          return file.pipe(res);
        } else {
          const head = {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mpeg',
          };
          res.writeHead(200, head);
          return fs.createReadStream(audioPath).pipe(res);
        }
      }
    }

    return res.status(404).json({ error: 'Audio stream source not available' });
  } catch (err) {
    next(err);
  }
};
