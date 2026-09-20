# 🎵 Aura Music Streaming Platform — Master Project Documentation

Welcome to the central documentation for the **Aura Music Streaming Platform** ecosystem. This document contains complete specifications, technical architecture, database schemas, API routes, component structures, asset pipelines, and deployment instructions for the entire project workspace.

---

## 📋 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Ecosystem Architecture & Folder Layout](#-ecosystem-architecture--folder-layout)
3. [Sub-Project Deep Dives](#-sub-project-deep-dives)
   - [1. Frontend (`/frontend`)](#1-frontend-frontend)
   - [2. Music Streaming App (`/music-streaming-app`)](#2-music-streaming-app-music-streaming-app)
   - [3. Aura Landing Showcase (`/aura-landing`)](#3-aura-landing-showcase-aura-landing)
   - [4. Music Assets Pipeline (`/music-assets`)](#4-music-assets-pipeline-music-assets)
4. [Database Schema & Data Models](#-database-schema--data-models)
5. [Complete REST API Reference](#-complete-rest-api-reference)
6. [WebGL 3D Ferrofluid Visualizer](#-webgl-3d-ferrofluid-visualizer)
7. [Asset Processing & CDN Distribution](#-asset-processing--cdn-distribution)
8. [Environment Variables & Configuration](#-environment-variables--configuration)
9. [Setup & Execution Guide](#-setup--execution-guide)

---

## 🚀 Executive Summary

The **Aura Music Streaming Platform** is a full-stack, enterprise-grade music streaming ecosystem designed with modern web techniques. It combines a high-performance audio engine, a fluid WebGL 3D audio visualizer, secure JWT authentication, RESTful APIs, MySQL database persistence, and an automated Python music asset & metadata ingestion engine.

### Key Highlights
- **Modern Stack**: React 19, Vite, Tailwind CSS v4, Express.js, MySQL, OGL (WebGL), Framer Motion.
- **WebGL Ferrofluid Visualizer**: Real-time 3D fluid visualizer that animates to audio spectrum frequencies.
- **Seamless Streaming Engine**: Custom Node.js streaming controller supporting HTTP 206 Partial Content range requests and fallback CDN distribution via jsDelivr.
- **Automated Metadata Extraction**: Python script using `ffprobe` to automatically inspect MP3 tags, slugify filenames, create structured JSON metadata (`songs.json`), and push artwork/lyrics to CDN assets.

---

## 📐 Ecosystem Architecture & Folder Layout

```
music-app/
├── PROJECT_OVERVIEW.md         # Master Documentation (This File)
├── README.md                   # Quickstart Guide
├── frontend/                   # Main Production React Application
│   ├── src/
│   │   ├── api/                # Axios Client & API Service Methods
│   │   ├── components/         # Modular Components
│   │   │   ├── Dashboard/      # Category Cards, Featured Carousel, New Releases, etc.
│   │   │   ├── Header/         # Navigation Header, Search, Profile Dropdown
│   │   │   ├── MiddlePart/     # Center Audio Feed & Playlists
│   │   │   ├── MusicPlayer/    # Full Audio Player Controls & Seekbar
│   │   │   ├── Ferrofluid.jsx  # WebGL 3D Audio Visualizer Component
│   │   │   ├── Ferrofluid.css  # WebGL Canvas Styling
│   │   │   ├── AlbumCarousel.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx  # Central Application State & Audio Controller
│   │   ├── data/               # Local Fallback Data & Songs Metadata
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── pages/              # Landing, Login, Register, NotFound
│   │   ├── App.jsx             # Main Application Routing & Dynamic Glow Background
│   │   └── main.jsx            # Application Entrypoint
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── music-streaming-app/        # Backend & Full-Stack Core Server
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/         # Database Pool (`db.js`)
│   │   │   ├── controllers/    # Auth, Song, Playlist, Like, Activity, Image Controllers
│   │   │   ├── middleware/     # Rate Limiter, Input Validator, JWT Authenticator
│   │   │   ├── routes/         # Express Feature Routers
│   │   │   ├── services/       # Business Logic Services
│   │   │   └── app.js          # Express Application Entry
│   │   ├── server.js           # Express Listener (Port 5000)
│   │   ├── package.json
│   │   └── .env
│   ├── frontend/               # Secondary/Legacy React Frontend Module
│   └── docs/                   # Architectural & System Requirements Specs
│
├── aura-landing/               # Standalone Marketing & Showcase Landing Page
│   ├── src/
│   │   ├── pages/              # Landing, Login, Register
│   │   └── App.jsx
│   └── package.json
│
└── music-assets/               # Music Asset Management & Pipeline
    ├── generate_assets.py      # Python Automated MP3 & Metadata Ingestion Script
    ├── songs.json              # Master Catalog Metadata (IDs, URLs, Artists, Slugs)
    ├── songs/                  # Standardized MP3 Files
    ├── images/                 # Album Cover Artworks (WebP format)
    ├── lyrics/                 # Track Lyrics Text Files
    └── documentation/
        └── SONGS.md            # Auto-generated Songs Catalog Markdown
```

---

## 🔍 Sub-Project Deep Dives

### 1. Frontend (`/frontend`)
The primary client web application built with **React 19** and **Vite**.
- **State Engine (`AppContext.jsx`)**: Manages HTML5 audio playback, current playing track, queue sequence, player expansion modal, search queries, user profile state, liked tracks, and backend API syncing.
- **Dynamic Glow Background**: Evaluates the currently playing song's artwork and projects an ambient backdrop blur overlay with multi-layered CSS blur orbs.
- **Routing (`App.jsx`)**:
  - `/` & `/landing`: Aura platform public landing page.
  - `/login`: User authentication portal.
  - `/register`: User sign-up portal.
  - `/home`: Protected dashboard & music streaming player layout (guarded by `ProtectedRoute.jsx`).

### 2. Music Streaming App (`/music-streaming-app`)
The enterprise Express.js backend server supporting full music streaming.
- **Audio Streaming Controller (`songController.js`)**: Serves audio files with HTTP range request support (`Range: bytes=0-`), enabling smooth seeking without reloading the full file.
- **Security Middleware**:
  - `authenticateToken`: Validates JWT bearer tokens.
  - `authLimiter`: Rate-limits login and registration attempts to prevent brute-force attacks.
  - `validateRegister` / `validateLogin`: Input sanitization and validation.
- **Database Layer**: Uses `mysql2/promise` connection pool to execute async queries.

### 3. Aura Landing Showcase (`/aura-landing`)
A lightweight, high-performance promotional landing application designed for public discovery, showcasing features, pricing, and fast user onboarding.

### 4. Music Assets Pipeline (`/music-assets`)
An automated asset engine that scans local music folders:
- Extracts ID3 metadata (Title, Artist, Album) using `ffprobe`.
- Standardizes filenames using kebab-case slugification.
- Generates `songs.json` containing CDN links formatted for **jsDelivr** (`https://cdn.jsdelivr.net/gh/<USER>/music-assets/songs/<slug>.mp3`).
- Constructs markdown documentation (`documentation/SONGS.md`) listing all available tracks.

---

## 🗄️ Database Schema & Data Models

The MySQL database schema (`music_db`) consists of 8 core tables:

```sql
-- 1. Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Artists Table
CREATE TABLE artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  image_url VARCHAR(255)
);

-- 3. Albums Table
CREATE TABLE albums (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cover_url VARCHAR(255),
  artist_id INT,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
);

-- 4. Songs Table
CREATE TABLE songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  artist_id INT,
  album_id INT,
  audio_url VARCHAR(255) NOT NULL,
  cover_url VARCHAR(255),
  duration INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
);

-- 5. Likes Table
CREATE TABLE likes (
  user_id INT NOT NULL,
  song_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, song_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- 6. Play History Table
CREATE TABLE play_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  song_id INT NOT NULL,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- 7. Playlists Table
CREATE TABLE playlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Playlist Songs Table
CREATE TABLE playlist_songs (
  playlist_id INT NOT NULL,
  song_id INT NOT NULL,
  PRIMARY KEY (playlist_id, song_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);
```

---

## 🌐 Complete REST API Reference

Base Endpoint: `/api`

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch currently authenticated user profile |
| `PUT` | `/api/auth/profile` | Protected | Update profile name, bio, or avatar |

### 🎶 Songs & Audio Streaming (`/api/songs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/songs` | Public | Retrieve all songs metadata |
| `GET` | `/api/songs/search` | Public | Search songs by title or artist query |
| `GET` | `/api/songs/:id` | Public | Retrieve specific song metadata |
| `GET` | `/api/songs/:id/stream` | Public | Stream audio with Range support (`206 Partial Content`) |

### 🖼️ Images & Artwork (`/api/images`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/images/song/:id` | Public | Serve song album cover art |

### 💖 Likes & Favorites (`/api/likes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/likes` | Protected | Get user's liked song IDs |
| `POST` | `/api/likes/:songId` | Protected | Like a song |
| `DELETE` | `/api/likes/:songId` | Protected | Remove song from liked list |

### 📁 Playlists (`/api/playlists`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/playlists` | Protected | Get all playlists created by user |
| `POST` | `/api/playlists` | Protected | Create a new playlist |
| `GET` | `/api/playlists/:id` | Protected | Get playlist details & songs |
| `POST` | `/api/playlists/:id/songs` | Protected | Add song to playlist |
| `DELETE` | `/api/playlists/:id/songs/:songId` | Protected | Remove song from playlist |

### 📊 Activity & Health (`/api/activities` & `/api/health`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Backend health check status (`{ status: "ok" }`) |
| `POST` | `/api/activities/play` | Protected | Log a song play event to `play_history` |
| `GET` | `/api/activities/history` | Protected | Fetch user's recent listening history |

---

## 🧪 WebGL 3D Ferrofluid Visualizer

Located at `frontend/src/components/Ferrofluid.jsx`, this interactive component utilizes **OGL** (a high-performance 3D WebGL library) to render a dynamic ferrofluid sphere.

### How It Works:
1. **Audio Spectrum Analysis**: Uses Web Audio API `AudioContext` and `AnalyserNode` connected to the active `<audio>` HTML element.
2. **Vertex Shader Displacements**: Frequencies from low bass to high treble modulate vertex offsets along surface normals, distorting the sphere into responsive fluid spikes.
3. **Fragment Shader Shading**: Applies metallic reflection, specular highlights, and chromatic glow matching the active theme color palette.

---

## 📦 Asset Processing & CDN Distribution

The `music-assets` module provides automatic metadata ingestion:
1. Put raw `.mp3` files in `/home/omr/Music/songs/`.
2. Run `python3 generate_assets.py`.
3. The script:
   - Queries file tags via `ffprobe`.
   - Generates clean filenames (e.g., `sunn-raha-hai.mp3`).
   - Generates `songs.json` linking audio, artwork (`images/*.webp`), and lyrics (`lyrics/*.txt`).
   - Formats URLs for CDN delivery using GitHub + jsDelivr:
     `https://cdn.jsdelivr.net/gh/<USERNAME>/music-assets/songs/<slug>.mp3`

---

## ⚙️ Environment Variables & Configuration

### Backend `.env` (`music-streaming-app/backend/.env`)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=music_db
JWT_SECRET=super_secret_jwt_key_aura_music_2026
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env` (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🛠️ Setup & Execution Guide

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8+)
- Python 3 + `ffprobe` (optional, for asset generation)

### 1. Database Setup
```bash
mysql -u root -p
CREATE DATABASE music_db;
-- Execute the SQL schema provided in the Database Schema section above.
```

### 2. Start Backend Server
```bash
cd music-streaming-app/backend
npm install
npm run dev
# Server running at http://localhost:5000
```

### 3. Start Frontend Client
```bash
cd frontend
npm install
npm run dev
# Application running at http://localhost:5173
```

### 4. (Optional) Run Asset Pipeline
```bash
cd music-assets
python3 generate_assets.py
```

---
*Documentation generated on 2026-09-21 for Aura Music Streaming Platform.*
