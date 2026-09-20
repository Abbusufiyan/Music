# Music Streaming Application

## Overview
A full‑stack music streaming web application built with **React**, **Vite**, **Tailwind CSS** on the frontend and **Node.js**, **Express.js**, **MySQL** on the backend. It showcases modern web development practices, RESTful API design, JWT authentication, and scalable audio delivery.

## Architecture
- **Frontend** (`frontend/`): React SPA created with Vite. Uses Axios for API calls and Tailwind CSS for styling.
- **Backend** (`backend/`): Express server handling REST APIs, MySQL connections, and serving static audio files during development.
- **Database** (`MySQL`): Stores metadata for users, artists, albums, songs, likes, playlists, and play history.
- **Audio Storage**: Local `backend/songs/` directory in development; later swapped to CDN/object storage via the `audio_url` column.

## Technology Stack
- **Frontend**: React, Vite, JavaScript, Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express.js, dotenv, cors, mysql2
- **Database**: MySQL
- **Auth**: JWT, bcrypt

## Project Structure
```
music-streaming-app/
│
├─ frontend/                # React application
├─ backend/                 # Express API
├─ docs/                    # Documentation (requirements, architecture, database, …)
├─ README.md                # Project overview
└─ .gitignore
```

## Getting Started
1. Clone the repository.
2. Install dependencies for both frontend and backend (`npm install` in each folder).
3. Set up a MySQL database and copy `.env.example` to `.env` with your credentials.
4. Run the backend (`npm run dev` in `backend/`) and the frontend (`npm run dev` in `frontend/`).

*Further setup steps will be added as the project progresses.*

---
*Documentation will be expanded in the `docs/` directory.*
