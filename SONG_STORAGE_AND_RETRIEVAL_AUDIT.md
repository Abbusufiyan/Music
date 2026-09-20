# 🔍 System Analysis: Song Storage, Retrieval & Streaming Flow

This report provides a complete, file-by-file audit of the song storage and retrieval pipeline for the **Aura Music Streaming Platform**. No code was modified during this inspection.

---

## 📍 Direct Answers to Inspection Questions

### 1. Where the actual MP3 files are currently stored
* **Primary Asset Ingestion Directory**: `/home/omr/Desktop/music-app/music-assets/songs/` (contains processed MP3 files, e.g. `sunn-raha-hai.mp3`, `tum-hi-ho.mp3`).
* **Raw Master Source Directory**: `/home/omr/Music/songs/` (configured as `SOURCE_ROOT` in `music-assets/generate_assets.py`).
* **Backend Local Audio Folder**: `/home/omr/Desktop/music-app/music-streaming-app/backend/songs/` (referenced in `songController.js` via `path.join(__dirname, '../../songs', audioUrl)`).

### 2. Where cover images are currently stored
* **Local Asset Directory**: `/home/omr/Desktop/music-app/music-assets/images/` (contains `.webp` cover images generated per track).
* **Google Drive / Service Scanner**: Scanned dynamically via `music-streaming-app/backend/src/services/imageService.js` (`scanDriveImages`).
* **Fallback Remote Images**: Unsplash static URLs (e.g. `https://images.unsplash.com/photo-1635805737707-575885ab0820...`).

### 3. What `audio_url` in the MySQL `songs` table currently contains
* Stores either:
  1. A relative filename/path (e.g., `sunn-raha-hai.mp3`).
  2. A jsDelivr CDN URL (e.g., `https://cdn.jsdelivr.net/gh/Abbusufiyan/music-assets/songs/sunn-raha-hai.mp3`).
  3. External stream link or Google Drive link.
* *Note*: The `songs` table also contains a dedicated `drive_file_id` column for Google Drive file IDs.

### 4. What `cover_url` currently contains
* Stores a relative cover image filename (e.g., `tum-hi-ho-arijit-singhmithoon.webp`), a jsDelivr CDN URL, or an Unsplash image URL.

### 5. Which backend controller handles `GET /api/songs`
* **Controller**: `exports.getAllSongs` in [songController.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/controllers/songController.js#L41-L57).
* **Route Registration**: Registered in [songRoutes.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/routes/songRoutes.js#L6) (`router.get('/', songController.getAllSongs)`).

### 6. Which backend controller/route handles `GET /api/songs/:id/stream`
* **Route**: Registered in [songRoutes.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/routes/songRoutes.js#L15) (`router.get('/:id/stream', songController.streamSong)`).
* **Controller**: `exports.streamSong` in [songController.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/controllers/songController.js#L85-L203).

### 7. Which backend route handles `/api/images/song/:id`
* **Route**: Registered in [imageRoutes.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/routes/imageRoutes.js#L6) (`router.get('/song/:id', imageController.getSongImage)`).
* **Controller**: `exports.getSongImage` in [imageController.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/controllers/imageController.js#L9-L43).

### 8. Where `audio_url` is converted into `/api/songs/:id/stream`
* **Backend Conversion**: Inside function `formatSong()` in [songController.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/controllers/songController.js#L25-L38):
  ```javascript
  audioUrl = `/api/songs/${song.id}/stream`;
  ```
* **Frontend Guard/Fallback**: Inside function `formatSongObject()` in [AppContext.jsx](file:///home/omr/Desktop/music-app/frontend/src/context/AppContext.jsx#L33-L72):
  ```javascript
  if (!audioUrl || audioUrl.includes('drive.google.com') || Number(id) >= 16) {
    audioUrl = `/api/songs/${id}/stream`;
  }
  ```

### 9. Where the actual MP3 is read/streamed from
* Inside `exports.streamSong` in [songController.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/controllers/songController.js#L85-L203):
  1. **Google Drive Branch**: If `drive_file_id` is set, streams from Google Drive API using `getDriveFileStream(driveFileId, req.headers)` in [driveService.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/services/driveService.js).
  2. **Local File Branch**: If local file exists in `backend/songs/${audioUrl}`, reads file with `fs.createReadStream()` using `HTTP 206 Partial Content` range streaming.
  3. **External HTTP Branch**: Redirects to external URL via `res.redirect(audioUrl)`.
  4. **Fallback Audio Branch**: Streams demo MP3 via `https.get(fallbackUrl).pipe(res)`.

### 10. Where the frontend receives and normalizes the song object
* **API Service Call**: Fetched in `songService.getAllSongs()` in [services.js](file:///home/omr/Desktop/music-app/frontend/src/api/services.js).
* **Normalization Engine**: Normalized in `formatSongObject()` in [AppContext.jsx](file:///home/omr/Desktop/music-app/frontend/src/context/AppContext.jsx#L33-L72).

---

## 🔗 Trace of One Song: Ingestion ➔ Storage ➔ MySQL ➔ Express ➔ API ➔ AppContext ➔ Player

```
[ STEP 1: STORAGE & INGESTION ]
Raw File: /home/omr/Music/songs/3. Sunn Raha Hai.mp3
   │
   ▼
Executed Script: music-assets/generate_assets.py
   │  - ffprobe extracts metadata tags
   │  - Generates slug: "sunn-raha-hai.mp3"
   ▼
Destination Assets:
   ├── MP3 File: music-assets/songs/sunn-raha-hai.mp3
   └── Catalog: music-assets/songs.json

[ STEP 2: MYSQL DATABASE ]
Table: `songs`
Columns:
   ├── id: 1
   ├── title: "Sunn Raha Hai"
   ├── audio_url: "sunn-raha-hai.mp3"
   ├── drive_file_id: "1A2B3C..."
   └── cover_url: "sunn-raha-hai.webp"

[ STEP 3: EXPRESS API & CONTROLLER ]
Client Request: GET /api/songs
   │
   ▼
Route: music-streaming-app/backend/src/routes/songRoutes.js
   │  router.get('/', songController.getAllSongs)
   ▼
Controller: music-streaming-app/backend/src/controllers/songController.js
   │  Executes SELECT_SONG_SQL on MySQL db
   │  Invokes formatSong(row):
   │     song.audioUrl ➔ "/api/songs/1/stream"
   │     song.artwork  ➔ "/api/images/song/1"
   ▼
HTTP 200 Response: JSON Array with formatted songs

[ STEP 4: FRONTEND APPCONTEXT STATE ]
File: frontend/src/context/AppContext.jsx
   │  Invokes songService.getAllSongs()
   │  Passes payload through formatSongObject(s)
   │  Updates state: setAllSongs([...]), setCurrentSong(song)
   ▼
Current Playing Song Object:
{
  id: "1",
  title: "Sunn Raha Hai",
  artist: "Ankit Tiwari",
  audioUrl: "/api/songs/1/stream",
  artwork: "/api/images/song/1"
}

[ STEP 5: PLAYER & AUDIO STREAMING ]
File: frontend/src/components/MusicPlayer/MusicPlayer.jsx
   │  User clicks Play ➔ audioRef.current.src = "/api/songs/1/stream"
   │  audioRef.current.play()
   ▼
Browser sends GET /api/songs/1/stream (Range: bytes=0-)
   │
   ▼
Backend Controller: songController.js (streamSong)
   │  Checks `drive_file_id` or local file path
   │  Pipes audio stream chunks back to browser (HTTP 206 Partial Content)
   ▼
Audio Playback & WebGL Visualizer (Ferrofluid.jsx):
   AnalyserNode reads stream frequencies ➔ Distorts 3D Ferrofluid mesh!
```

---

## 🚀 Migration Assessment: Google Drive Integration

### 🛠️ Files to Modify for Google Drive Storage Migration
1. **[songController.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/controllers/songController.js)**:
   * Ensure `streamSong` handles all song requests by retrieving stream chunks via `getDriveFileStream(driveFileId, req.headers)`.
2. **MySQL Database (`songs` table)**:
   * Populate the `drive_file_id` column for all song records with their corresponding Google Drive file IDs.
3. **[generate_assets.py](file:///home/omr/Desktop/music-app/music-assets/generate_assets.py)** (Optional automation script):
   * Add Google Drive API upload step to automatically upload processed MP3s and save `drive_file_id` into database/json seeds.

### 🛡️ Components That REMAIN UNCHANGED (Zero Modification Needed)
1. **Frontend HTML5 Audio Player** ([MusicPlayer.jsx](file:///home/omr/Desktop/music-app/frontend/src/components/MusicPlayer/MusicPlayer.jsx)):
   * Remains **100% unchanged**. The player continues to point to `/api/songs/:id/stream`.
2. **3D WebGL Ferrofluid Visualizer** ([Ferrofluid.jsx](file:///home/omr/Desktop/music-app/frontend/src/components/Ferrofluid.jsx)):
   * Remains **100% unchanged**. Reads Web Audio API `AnalyserNode` connected to `<audio>`.
3. **Frontend AppContext State Engine** ([AppContext.jsx](file:///home/omr/Desktop/music-app/frontend/src/context/AppContext.jsx)):
   * Remains **100% unchanged**. Consumes standardized `audioUrl: "/api/songs/:id/stream"` objects.
4. **API Client & Services** ([apiClient.js](file:///home/omr/Desktop/music-app/frontend/src/api/apiClient.js), [services.js](file:///home/omr/Desktop/music-app/frontend/src/api/services.js)):
   * Remains **100% unchanged**.
5. **Backend Express Route Registry** ([songRoutes.js](file:///home/omr/Desktop/music-app/music-streaming-app/backend/src/routes/songRoutes.js), `routes/index.js`):
   * Endpoint definitions (`GET /api/songs`, `GET /api/songs/:id/stream`) stay identical.

---
*Audit completed on 2026-09-21 for Aura Music Streaming Platform. No source code modified.*
