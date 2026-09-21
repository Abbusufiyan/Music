const pool = require('../src/config/db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // 1. Ensure playlists table has description column
    try {
      await pool.query('ALTER TABLE playlists ADD COLUMN description VARCHAR(255) AFTER name;');
      console.log('Added description column to playlists table.');
    } catch (e) {
      // Column might already exist
    }

    // 2. Clear existing data in reverse order of dependencies
    await pool.query('DELETE FROM playlist_songs');
    await pool.query('DELETE FROM playlists');
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM play_history');
    await pool.query('DELETE FROM songs');
    await pool.query('DELETE FROM albums');
    await pool.query('DELETE FROM artists');

    console.log('Cleared existing tables.');

    // 3. Insert Artists
    const artists = [
      { id: 1, name: 'A.R. Rahman', image_url: '/api/images/artist/ar-rahman' },
      { id: 2, name: 'Atif Aslam', image_url: '/api/images/artist/atif-aslam' },
      { id: 3, name: 'Arijit Singh', image_url: '/api/images/artist/arijit-singh' },
      { id: 4, name: 'Nusrat Fateh Ali Khan', image_url: '/api/images/artist/nusrat-fateh-ali-khan' },
      { id: 5, name: 'Anuv Jain', image_url: '/api/images/artist/anuv-jain' },
      { id: 6, name: 'Javed Ali', image_url: '/api/images/artist/javed-ali' },
      { id: 7, name: 'Mohit Chauhan', image_url: '/api/images/artist/mohit-chauhan' },
      { id: 8, name: 'Mohammed Rafi', image_url: '/api/images/artist/mohamad-rafi' },
      { id: 9, name: 'Sonu Nigam', image_url: '/api/images/artist/sonu-nigam' },
      { id: 10, name: 'Dua Lipa', image_url: '/api/images/artist/dua' },
      { id: 11, name: 'KK', image_url: '/api/images/artist/kk' },
      { id: 12, name: 'Darshan Raval', image_url: '/api/images/artist/darshan-raval' },
      { id: 13, name: 'The Weeknd', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
    ];

    for (const a of artists) {
      await pool.query('INSERT INTO artists (id, name, image_url) VALUES (?, ?, ?)', [a.id, a.name, a.image_url]);
    }
    console.log(`Inserted ${artists.length} artists.`);

    // 4. Insert Albums
    const albums = [
      { id: 1, name: 'Rockstar', artist_id: 1, cover_url: '/api/images/song/20' },
      { id: 2, name: 'Badlapur', artist_id: 2, cover_url: '/api/images/song/17' },
      { id: 3, name: 'Aashiqui 2', artist_id: 3, cover_url: '/api/images/song/31' },
      { id: 4, name: 'Qawwali Classics', artist_id: 4, cover_url: '/api/images/song/38' },
      { id: 5, name: 'Baarishein', artist_id: 5, cover_url: '/api/images/song/22' },
      { id: 6, name: 'Ghajini', artist_id: 6, cover_url: '/api/images/song/19' },
    ];

    for (const al of albums) {
      await pool.query('INSERT INTO albums (id, name, artist_id, cover_url) VALUES (?, ?, ?, ?)', [al.id, al.name, al.artist_id, al.cover_url]);
    }
    console.log(`Inserted ${albums.length} albums.`);

    // 5. Insert Initial Songs
    const songs = [
      { id: 1, title: 'Sunn Raha Hai', artist_id: 3, album_id: 3, audio_url: '/api/songs/1/stream', cover_url: '/api/images/song/1', duration: 385 },
      { id: 2, title: 'Tum Hi Ho', artist_id: 3, album_id: 3, audio_url: '/api/songs/2/stream', cover_url: '/api/images/song/2', duration: 262 },
      { id: 3, title: 'Chahun Main Ya Naa', artist_id: 3, album_id: 3, audio_url: '/api/songs/3/stream', cover_url: '/api/images/song/3', duration: 304 },
      { id: 4, title: 'Ae Dil Hai Mushkil Title Track', artist_id: 3, album_id: 3, audio_url: '/api/songs/4/stream', cover_url: '/api/images/song/4', duration: 269 },
      { id: 5, title: 'Daastan', artist_id: 2, album_id: 2, audio_url: '/api/songs/5/stream', cover_url: '/api/images/song/5', duration: 250 },
      { id: 6, title: 'Guzarish', artist_id: 6, album_id: 6, audio_url: '/api/songs/6/stream', cover_url: '/api/images/song/6', duration: 329 },
      { id: 7, title: 'Aasan Nahin Yahan', artist_id: 3, album_id: 3, audio_url: '/api/songs/7/stream', cover_url: '/api/images/song/7', duration: 214 },
      { id: 8, title: 'Baarishein', artist_id: 5, album_id: 5, audio_url: '/api/songs/8/stream', cover_url: '/api/images/song/8', duration: 207 },
      { id: 9, title: 'Tum Ho', artist_id: 7, album_id: 1, audio_url: '/api/songs/9/stream', cover_url: '/api/images/song/9', duration: 318 },
      { id: 10, title: 'Arz Kiya Hai', artist_id: 5, album_id: 5, audio_url: '/api/songs/10/stream', cover_url: '/api/images/song/10', duration: 295 },
      { id: 11, title: 'Khat', artist_id: 3, album_id: 3, audio_url: '/api/songs/11/stream', cover_url: '/api/images/song/11', duration: 245 },
      { id: 12, title: 'Jeena Jeena', artist_id: 2, album_id: 2, audio_url: '/api/songs/12/stream', cover_url: '/api/images/song/12', duration: 229 },
      { id: 13, title: 'Darkhaast', artist_id: 3, album_id: 3, audio_url: '/api/songs/13/stream', cover_url: '/api/images/song/13', duration: 375 },
      { id: 14, title: 'Nadaan Parinde', artist_id: 1, album_id: 1, audio_url: '/api/songs/14/stream', cover_url: '/api/images/song/14', duration: 385 },
      { id: 15, title: 'Tum Se Hi', artist_id: 7, album_id: 1, audio_url: '/api/songs/15/stream', cover_url: '/api/images/song/15', duration: 323 },
    ];

    for (const s of songs) {
      await pool.query(
        'INSERT INTO songs (id, title, artist_id, album_id, audio_url, cover_url, duration) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.title, s.artist_id, s.album_id, s.audio_url, s.cover_url, s.duration]
      );
    }
    console.log(`Inserted ${songs.length} songs.`);

    // 6. Ensure default demo user exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', ['omr@music.app']);
    if (existingUser.length === 0) {
      const hashed = await bcrypt.hash('123456', 10);
      await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        ['omr', 'omr@music.app', hashed]
      );
      console.log('Created default user omr@music.app / 123456');
    }

    console.log('✅ Database seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
