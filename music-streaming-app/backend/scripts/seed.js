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
      { id: 1, name: 'The Weeknd', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
      { id: 2, name: 'Dua Lipa', image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
      { id: 3, name: 'Arctic Monkeys', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' },
      { id: 4, name: 'Tame Impala', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
      { id: 5, name: 'Billie Eilish', image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
      { id: 6, name: 'JVKE', image_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop' },
    ];

    for (const a of artists) {
      await pool.query('INSERT INTO artists (id, name, image_url) VALUES (?, ?, ?)', [a.id, a.name, a.image_url]);
    }
    console.log(`Inserted ${artists.length} artists.`);

    // 4. Insert Albums
    const albums = [
      { id: 1, name: 'After Hours', artist_id: 1, cover_url: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=400&fit=crop' },
      { id: 2, name: 'Starboy', artist_id: 1, cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop' },
      { id: 3, name: 'Future Nostalgia', artist_id: 2, cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
      { id: 4, name: 'AM', artist_id: 3, cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' },
      { id: 5, name: 'The Slow Rush', artist_id: 4, cover_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
      { id: 6, name: 'Happier Than Ever', artist_id: 5, cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
    ];

    for (const al of albums) {
      await pool.query('INSERT INTO albums (id, name, artist_id, cover_url) VALUES (?, ?, ?, ?)', [al.id, al.name, al.artist_id, al.cover_url]);
    }
    console.log(`Inserted ${albums.length} albums.`);

    // 5. Insert Songs
    const songs = [
      { id: 1, title: 'Across the Universe', artist_id: 1, album_id: 1, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover_url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=400&fit=crop', duration: 214 },
      { id: 2, title: 'Neon Nights', artist_id: 1, album_id: 1, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', duration: 198 },
      { id: 3, title: 'Midnight Pulse', artist_id: 2, album_id: 3, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop', duration: 185 },
      { id: 4, title: 'Golden Hour', artist_id: 6, album_id: 6, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop', duration: 203 },
      { id: 5, title: 'Forest Echo', artist_id: 3, album_id: 4, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop', duration: 220 },
      { id: 6, title: 'Road Trip', artist_id: 4, album_id: 5, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', duration: 195 },
      { id: 7, title: 'Studio Session', artist_id: 5, album_id: 6, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop', duration: 178 },
      { id: 8, title: 'Blinding Lights', artist_id: 1, album_id: 1, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop', duration: 200 },
      { id: 9, title: 'Starboy', artist_id: 1, album_id: 2, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop', duration: 230 },
      { id: 10, title: 'After Hours', artist_id: 1, album_id: 1, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover_url: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop', duration: 242 },
      { id: 11, title: 'Save Your Tears', artist_id: 1, album_id: 1, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', duration: 215 },
      { id: 12, title: 'Lo-fi Dreams', artist_id: 6, album_id: 6, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover_url: 'https://images.unsplash.com/photo-1514320291840-755a4158e530?w=200&h=200&fit=crop', duration: 190 },
      { id: 13, title: 'Power Up', artist_id: 2, album_id: 3, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', cover_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop', duration: 205 },
      { id: 14, title: 'Sunset Drive', artist_id: 4, album_id: 5, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', cover_url: 'https://images.unsplash.com/photo-1498038432885-c6f89faf8b09?w=200&h=200&fit=crop', duration: 188 },
      { id: 15, title: 'Blue Notes', artist_id: 3, album_id: 4, audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', cover_url: 'https://images.unsplash.com/photo-1415201364774-f6f0ff35ab28?w=200&h=200&fit=crop', duration: 256 },
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
