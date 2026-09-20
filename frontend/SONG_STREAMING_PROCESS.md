# 🎧 End-to-End Song Retrieval & Audio Streaming Architecture

Please see the main root document for the full step-by-step breakdown:
👉 **[SONG_STREAMING_PROCESS.md](file:///home/omr/Desktop/music-app/SONG_STREAMING_PROCESS.md)**

---

## ⚡ Quick Architecture Summary

```
Raw MP3 ➔ ffprobe (generate_assets.py) ➔ songs.json ➔ MySQL DB
  ➔ GET /api/songs (Backend Controller)
  ➔ formatSongObject() (Frontend AppContext.jsx)
  ➔ <audio src="/api/songs/:id/stream"> (MusicPlayer.jsx)
  ➔ GET /api/songs/:id/stream (HTTP 206 Partial Content Range Stream)
  ➔ Web Audio API AnalyserNode ➔ WebGL 3D Ferrofluid Visualizer (Ferrofluid.jsx)
```
