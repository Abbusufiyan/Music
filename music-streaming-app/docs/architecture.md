# Architecture Overview

## High‑Level Flow
```
User Browser
   │   (HTTP/HTTPS)
   ▼
React Frontend (Vite) – UI & client‑side logic
   │   (REST API calls via Axios)
   ▼
Express.js Backend – request handling, business logic
   │   (MySQL driver + file system)
   ▼
MySQL Database – stores metadata for users, artists, albums, songs, likes, playlists, history
   │
   └─► Local `songs/` directory (development) – MP3 files are served as static assets
```

### Development vs Production
- **Development**: Audio files are placed under `backend/songs/` and served through an endpoint like `/api/songs/:id/stream`. The `audio_url` field in the `songs` table contains a relative path (e.g., `/songs/song1.mp3`).
- **Production**: The same `audio_url` will contain a full CDN URL (e.g., `https://cdn.example.com/songs/song1.mp3`). The backend simply returns the URL; the frontend consumes it without any change, enabling a seamless migration.

### Key Design Principles
- **Separation of Concerns**: Frontend, backend, and database are independent projects.
- **Scalable Asset Strategy**: By abstracting the storage location into the `audio_url` column, we can switch from local filesystem to object storage/CDN without touching the client code.
- **RESTful API**: All client‑server communication follows HTTP verbs and proper status codes.
- **Security**: CORS, environment based configuration, JWT authentication (to be added later).

---
*This document will be expanded with component diagrams and deeper implementation details as the project progresses.*
