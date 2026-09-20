# Music Streaming Application – Requirements

## Overview
This project is a **full‑stack music streaming web application** designed to be production‑ready and resume‑worthy. It demonstrates modern web development skills across the stack:

- **Frontend** – React with Vite, Tailwind CSS, JavaScript, Axios, React Router
- **Backend** – Node.js, Express.js, REST APIs
- **Database** – MySQL
- **Authentication** – JWT, password hashing, protected routes
- **Audio** – Local storage during development, later migratable to CDN / object storage
- **Features** – Browse, search, playback, playlists, likes, history, user profiles, etc.

## Goals
- Clean, modular architecture that can evolve without major rewrites.
- Clear separation of concerns (frontend, backend, database).
- Documentation for every layer (requirements, architecture, database schema, API, authentication, audio streaming, deployment).
- Git best‑practice workflow with meaningful commits.

## Stages (Incremental Development)
1. **Project Foundation** – Define docs, repo layout, requirements.
2. **Backend Foundation** – Set up Express server, MySQL connection, basic middleware.
3. **Database Design** – Create tables for users, artists, albums, songs, etc.
4. **Song API** – Endpoints for retrieving and streaming songs.
5. **React Frontend** – Scaffold Vite + React app with core components.
6. **Music Player** – HTML5 audio player with full controls.
7. **Authentication** – Register / login / JWT protected routes.
8. **User Features** – Likes, history, profile.
9. **Playlists** – CRUD for playlists and song management.
10. **Search & Pagination** – Backend‑driven search.
11. **Audio Streaming** – HTTP range support documentation.
12. **CDN / Object Storage Migration** – Switch `audio_url` to CDN URLs.
13. **Deployment** – Production deployment strategy.

## Non‑Functional Requirements
- **Scalable** – Architecture permits moving from local files to cloud storage.
- **Secure** – No plain‑text passwords, proper CORS, JWT validation.
- **Maintainable** – Small, reusable components and controllers.
- **Documented** – Every major decision explained in Docs.
- **Testable** – API and UI testing planned.

---
*This document will be expanded with more detail as the project progresses.*
