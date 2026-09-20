# 🎧 End-to-End Song Retrieval & Audio Streaming Architecture

This document provides a comprehensive technical walkthrough of how songs are indexed, retrieved, requested, streamed, and visualized across the entire **Aura Music Streaming Platform** ecosystem—from the initial source file to the final WebGL 3D audio visualizer.

---

## 🗺️ Complete End-to-End Flow Diagram

```
[ Raw MP3 File ] ──► ( Python ffprobe Parser ) ──► [ songs.json Catalog ]
                                                          │
                                                          ▼
                                                  [ MySQL Database ]
                                                          │
                                                          ▼
                                            [ GET /api/songs Endpoint ]
                                                          │
                                                          ▼
                                              [ React AppContext State ]
                                                          │
                                                          ▼
                                        [ User Clicks Play on Song Card ]
                                                          │
                                                          ▼
                                          [ audioRef.src = /api/songs/:id/stream ]
                                                          │
                                                          ▼
                                        [ GET /api/songs/:id/stream Controller ]
                                                          │
                        ┌─────────────────────────────────┴─────────────────────────────────┐
                        │                                                                   │
                        ▼                                                                   ▼
       [ Route 1: Google Drive Stream ]                                      [ Route 2: Local File HTTP Range ]
          getDriveFileStream()                                                    fs.createReadStream()
       Pipe chunks with 206 Partial                                           bytes=start-end (206 Partial Content)
                        │                                                                   │
                        └─────────────────────────────────┬─────────────────────────────────┘
                                                          │
                                                          ▼
                                          [ Browser HTML5 <audio> Element ]
                                                          │
                                                          ▼
                                              [ Web Audio AnalyserNode ]
                                                          │
                                                          ▼
                                         [ WebGL 3D Ferrofluid Visualizer ]
```

---

## 📑 Detailed Step-by-Step Breakdown

### Step 1: Asset Cataloging & Metadata Extraction (`music-assets/`)

Before a song can be played, it goes through an automated Python processing script (`generate_assets.py`):
1. **Directory Scanning**: Scans `/home/omr/Music/songs` for raw `.mp3` files.
2. **Metadata Tagging (`ffprobe`)**: Extracts ID3 title, artist, and album tags using `ffprobe`:
   ```bash
   ffprobe -v error -show_entries format_tags=title,artist,album -of default=noprint_wrappers=1:nokey=1 song.mp3
   ```
3. **Slugification**: Converts titles into standardized URLs (e.g., `"Sunn Raha Hai"` ➔ `"sunn-raha-hai.mp3"`).
4. **JSON Ingestion**: Writes metadata records into `songs.json`:
   ```json
   {
     "id": 1,
     "song_name": "Sunn Raha Hai",
     "artist_name": "Ankit Tiwari",
     "album_name": "Aashiqui 2",
     "song_file": "songs/sunn-raha-hai.mp3",
     "song_url": "https://cdn.jsdelivr.net/gh/Abbusufiyan/music-assets/songs/sunn-raha-hai.mp3",
     "image_file": "images/sunn-raha-hai.webp"
   }
   ```

---

### Step 2: Database Persistence (`music-streaming-app/backend`)

Songs are stored in MySQL in the `songs` table joined with `artists` and `albums`:

```sql
SELECT 
  s.id, 
  s.title, 
  s.duration, 
  s.audio_url AS audioUrl, 
  s.cover_url AS artwork, 
  a.name AS artist, 
  al.name AS albumName,
  s.drive_file_id AS driveFileId
FROM songs s
LEFT JOIN artists a ON s.artist_id = a.id
LEFT JOIN albums al ON s.album_id = al.id;
```

---

### Step 3: Fetching the Song Catalog (`GET /api/songs`)

When the React frontend loads, it calls `GET /api/songs`.

#### Backend Controller (`songController.js`):
```javascript
exports.getAllSongs = async (req, res, next) => {
  const [rows] = await pool.query(`${SELECT_SONG_SQL} ORDER BY s.id ASC LIMIT ? OFFSET ?`, [limit, offset]);
  const formattedData = rows.map(formatSong);
  res.json({ total, page, limit, data: formattedData });
};

function formatSong(song) {
  return {
    ...song,
    id: String(song.id),
    artwork: `/api/images/song/${song.id}`,
    audioUrl: `/api/songs/${song.id}/stream`, // Rewrites audioUrl to streaming endpoint
  };
}
```

---

### Step 4: Client State Formatting (`frontend/src/context/AppContext.jsx`)

The React application receives the raw JSON array and sanitizes it via `formatSongObject(s)`:

```javascript
export function formatSongObject(s) {
  const id = String(s.id);
  let audioUrl = s.audioUrl || s.audio_url;

  // Fallback check to enforce API stream route
  if (!audioUrl || audioUrl.includes('drive.google.com') || Number(id) >= 16) {
    audioUrl = `/api/songs/${id}/stream`;
  }

  // Cross-reference with songs.json metadata for title/artist cleanup
  const meta = SONG_META_MAP.get(cleanTitle.toLowerCase());
  const artist = meta?.artist_name || s.artist || 'Unknown Artist';

  return {
    ...s,
    id,
    title: cleanTitle,
    artist,
    artwork: `/api/images/song/${id}`,
    audioUrl,
  };
}
```

---

### Step 5: User Action & Audio Element Binding (`MusicPlayer.jsx`)

When the user clicks **Play** on a song card:

```javascript
const playSong = (song) => {
  setCurrentSong(song);
  if (audioRef.current) {
    audioRef.current.src = song.audioUrl; // e.g. "/api/songs/1/stream"
    audioRef.current.play();
    setIsPlaying(true);
  }
};
```

---

### Step 6: Audio Streaming Endpoint (`GET /api/songs/:id/stream`)

When `<audio src="/api/songs/1/stream">` starts playing, the browser sends an HTTP request to the streaming route in Express.

The backend streaming controller (`songController.js`) handles 4 fallback strategies:

#### Strategy A: Google Drive Stream Pipeline
If `drive_file_id` is present in the database:
```javascript
const driveRes = await getDriveFileStream(driveFileId, req.headers);
res.status(driveRes.status || 200);
res.setHeader('Content-Type', driveRes.headers['content-type'] || 'audio/mpeg');
res.setHeader('Accept-Ranges', 'bytes');
return driveRes.stream.pipe(res); // Stream directly from Drive API
```

#### Strategy B: Local Filesystem Range Streaming (`HTTP 206 Partial Content`)
If the song is stored locally in `backend/songs/`:
```javascript
const audioPath = path.join(__dirname, '../../songs', audioUrl);
const stat = fs.statSync(audioPath);
const fileSize = stat.size;
const range = req.headers.range;

if (range) {
  // Parse Range header e.g. "bytes=0-"
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
  file.pipe(res); // Streams chunk directly to browser
}
```

#### Strategy C: External CDN / HTTP Redirect
If `audioUrl` points to a full HTTPS URL:
```javascript
if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
  return res.redirect(audioUrl);
}
```

#### Strategy D: SoundHelix Fallback Stream
If demo IDs (1–15) are requested without local files:
```javascript
https.get(fallbackUrl, (targetRes) => {
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Accept-Ranges', 'bytes');
  targetRes.pipe(res);
});
```

---

### Step 7: WebGL 3D Audio Visualizer (`Ferrofluid.jsx`)

While the `<audio>` element plays the incoming stream, the WebGL Ferrofluid visualizer taps into the audio node:

```javascript
// 1. Initialize Audio Context & Analyser Node
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 512;

// 2. Connect HTML5 Audio element to Web Audio API
const source = audioCtx.createMediaElementSource(audioRef.current);
source.connect(analyser);
analyser.connect(audioCtx.destination);

// 3. Render Loop: Frequency extraction to WebGL Shader
const dataArray = new Uint8Array(analyser.frequencyBinCount);
function animate() {
  analyser.getByteFrequencyData(dataArray);
  
  // Calculate average bass frequency (0 - 20Hz range)
  const bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  
  // Pass bass amplitude to OGL WebGL sphere uniform
  mesh.program.uniforms.uAudioBass.value = bass / 255.0;
  renderer.render({ scene, camera });
  requestAnimationFrame(animate);
}
```

---

## 🛠️ Summary Matrix of Endpoint to File Mapping

| Phase | Component / File | Responsibility |
|---|---|---|
| **1. Metadata Parsing** | [generate_assets.py](file:///home/omr/Desktop/music-app/music-assets/generate_assets.py) | Parses MP3 tags via `ffprobe`, creates `songs.json` catalog |
| **2. Database Query** | [songController.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/controllers/songController.js#L7-L22) | Queries MySQL for song records (`SELECT_SONG_SQL`) |
| **3. Catalog API** | `GET /api/songs` | Formats each song's `audioUrl` to `/api/songs/:id/stream` |
| **4. React State** | [AppContext.jsx](file:///home/omr/Desktop/music-app/frontend/src/context/AppContext.jsx#L33-L72) | Normalizes song objects (`formatSongObject`) |
| **5. Client Audio Target** | [MusicPlayer.jsx](file:///home/omr/Desktop/music-app/frontend/src/components/MusicPlayer/MusicPlayer.jsx) | Sets `<audio src="/api/songs/:id/stream">` and calls `.play()` |
| **6. Stream Endpoint** | `GET /api/songs/:id/stream` | Handles Range requests, Drive streams, HTTP 206 Partial Content |
| **7. 3D Visualizer** | [Ferrofluid.jsx](file:///home/omr/Desktop/music-app/frontend/src/components/Ferrofluid.jsx) | Reads `analyserNode` frequency data and distorts WebGL 3D mesh |

---
*Document created on 2026-09-21 for Aura Music Streaming Platform.*
