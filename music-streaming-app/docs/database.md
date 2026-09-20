# Database Design

*This document will describe the MySQL schema for the music streaming application.*

## Tables
- **users**: `id`, `username`, `email`, `password`, `created_at`
- **artists**: `id`, `name`, `image_url`
- **albums**: `id`, `name`, `cover_url`, `artist_id`
- **songs**: `id`, `title`, `artist_id`, `album_id`, `audio_url`, `cover_url`, `duration`, `created_at`
- **likes**: `user_id`, `song_id`, `created_at`
- **play_history**: `id`, `user_id`, `song_id`, `played_at`
- **playlists**: `id`, `name`, `user_id`, `created_at`
- **playlist_songs**: `playlist_id`, `song_id`

*Relationships and foreign keys will be defined in migration scripts later.*
