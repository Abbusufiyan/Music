# 🔍 System Analysis: Song Storage, Retrieval & Streaming Flow

Please see the main audit document for the full step-by-step breakdown:
👉 **[SONG_STORAGE_AND_RETRIEVAL_AUDIT.md](file:///home/omr/Desktop/music-app/SONG_STORAGE_AND_RETRIEVAL_AUDIT.md)**

---

## ⚡ Quick Architecture Trace

```
Storage (/home/omr/Desktop/music-app/music-assets/songs/)
 ➔ MySQL (`songs` table, `audio_url`, `drive_file_id`)
 ➔ Express Controller (`songController.js` formatSong)
 ➔ API (`GET /api/songs` & `GET /api/songs/:id/stream`)
 ➔ AppContext (`formatSongObject` in AppContext.jsx)
 ➔ Music Player & Ferrofluid Visualizer (`MusicPlayer.jsx` & `Ferrofluid.jsx`)
```
