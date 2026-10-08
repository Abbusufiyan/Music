# 🎵 Aura Music Streaming Platform

Welcome to the **Aura Music Streaming Platform** repository.

## What is Aura?

**Aura** is a modern, secure, full-stack music streaming platform where users can listen to their favorite songs and enjoy an immersive 3D visual experience powered by WebGL and audio-reactive visuals.

---

## 📖 Technical Documentation

For the complete project breakdown, including architecture, database schema, API references, visualizer details, and asset pipeline documentation, please see the central documentation: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)

---

## 📁 Repository Overview

This repository contains multiple modules that work together to deliver the full streaming experience:

- **frontend/**: Main React + Vite web application, including the music player and 3D visualizer.
- **music-streaming-app/**: Full-stack backend module built with Node.js, Express.js, and MySQL.
- **aura-landing/**: Standalone landing page for the product showcase.
- **music-assets/**: Asset-processing scripts and metadata for the music library, including `generate_assets.py` and `songs.json`.

---

## 🧰 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js, MySQL
- **Authentication**: JWT, bcrypt
- **Audio Processing**: Python, ffprobe
- **Visualization**: WebGL / OGL

---

## Prerequisites

Before running the project locally, make sure you have:

- **Node.js** 18 or later
- **npm**
- **MySQL 8+**
- **Python 3** (optional, for music asset processing)
- **Git**
- **ffprobe** (optional, for metadata extraction)

---

## ⚙️ Environment Variables & Configuration

Set up the required environment variables for the backend and frontend before starting the application.

### Backend (`music-streaming-app/backend/.env`)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=music_db
JWT_SECRET=your_super_secret_key
TOKEN_EXPIRES_IN=3600
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

> Note: the repository documentation may refer to `VITE_API_BASE_URL`; the local example currently uses `VITE_API_URL`. Adjust the variable name to match your local setup if needed.

---

## 🚀 Quickstart

### 1. Start the backend
```bash
cd music-streaming-app/backend
npm install
npm run dev
```

The backend will run on:

- `http://localhost:5000`

### 2. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on:

- `http://localhost:5173`

### 3. Open the app
Open the local frontend in your browser:

- `http://localhost:5173`

The deployed version of the application is also available here:

- https://music-six-lemon.vercel.app/

---

## 📌 Notes

Url inside the quickstart could change depending how you configure your .env file concerning the port. Be sure to always enter the correct one.

This repository includes multiple modules that work together to form the full music streaming platform:

- the main web application
- a backend API service
- a product landing page
- a music asset management pipeline

For deeper technical details, architecture, schemas, and API information, see [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).