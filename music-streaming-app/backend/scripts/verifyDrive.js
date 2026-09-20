const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../src/config/db');
const { listDriveAudioFiles, getDriveFileStream } = require('../src/services/driveService');
const http = require('http');

async function verify() {
  console.log('========================================');
  console.log('GOOGLE DRIVE MUSIC VERIFICATION');
  console.log('========================================\n');

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1eG72KlUDwm2d88QZtVYQlIF9RtXnSr_X';
  
  // 1. Google Drive Connection Check
  let driveFiles = [];
  let driveStatus = 'SUCCESS';
  let folderAccessible = 'YES';
  let driveError = null;

  try {
    driveFiles = await listDriveAudioFiles(folderId);
  } catch (err) {
    driveStatus = 'FAILED';
    folderAccessible = 'NO (Credentials Required)';
    driveError = err.message;
  }

  console.log(`Drive connection: ${driveStatus}`);
  console.log(`Folder: ${folderId}`);
  console.log(`Folder accessible: ${folderAccessible}`);
  if (driveError) {
    console.log(`Drive API Error Detail: ${driveError}`);
  }
  console.log(`Audio files found: ${driveFiles.length}`);

  if (driveFiles.length > 0) {
    console.log('\nDetected Drive Audio Files:');
    driveFiles.forEach((f, idx) => {
      console.log(`  ${idx + 1}. Name: "${f.name}" | ID: ${f.id} | Type: ${f.mimeType}`);
    });
  } else {
    console.log('\n(No audio files returned from Drive API call directly without API Key/Service Account credentials)');
  }

  // 2. Database Songs Query
  console.log('\n--- 2. DATABASE QUERY (songs table) ---');
  const [dbSongs] = await pool.query('SELECT id, title, drive_file_id, audio_url FROM songs ORDER BY id ASC');
  console.table(dbSongs);

  // 3. Database Integrity Verification
  console.log('\n--- 3. DATABASE INTEGRITY CHECK ---');
  const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
  const [playlists] = await pool.query('SELECT COUNT(*) as count FROM playlists');
  const [playlistSongs] = await pool.query('SELECT COUNT(*) as count FROM playlist_songs');
  const [likes] = await pool.query('SELECT COUNT(*) as count FROM likes');
  const [playHistory] = await pool.query('SELECT COUNT(*) as count FROM play_history');
  const [artists] = await pool.query('SELECT COUNT(*) as count FROM artists');
  const [albums] = await pool.query('SELECT COUNT(*) as count FROM albums');

  console.log(`Users count: ${users[0].count}`);
  console.log(`Playlists count: ${playlists[0].count}`);
  console.log(`Playlist Songs count: ${playlistSongs[0].count}`);
  console.log(`Likes count: ${likes[0].count}`);
  console.log(`Play History count: ${playHistory[0].count}`);
  console.log(`Artists count: ${artists[0].count}`);
  console.log(`Albums count: ${albums[0].count}`);

  // 4. Test Stream Endpoint & Range Request (http://localhost:3000/api/songs/1/stream)
  console.log('\n--- 4. STREAMING & RANGE REQUEST TEST ---');
  
  function testStreamRequest(songId, headers = {}) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/songs/${songId}/stream`,
        method: 'GET',
        headers: headers
      };
      
      const req = http.request(options, (res) => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers
        });
      });
      req.on('error', (e) => resolve({ statusCode: 500, error: e.message }));
      req.end();
    });
  }

  const normalRes = await testStreamRequest(1);
  console.log('Normal Request GET /api/songs/1/stream:');
  console.log(` -> Status: ${normalRes.statusCode}`);
  console.log(` -> Location (if redirect): ${normalRes.headers ? normalRes.headers.location : 'N/A'}`);
  console.log(` -> Content-Type: ${normalRes.headers ? normalRes.headers['content-type'] : 'N/A'}`);

  const rangeRes = await testStreamRequest(1, { Range: 'bytes=0-1023' });
  console.log('\nRange Request GET /api/songs/1/stream (Range: bytes=0-1023):');
  console.log(` -> Status: ${rangeRes.statusCode}`);
  console.log(` -> Content-Range: ${rangeRes.headers ? rangeRes.headers['content-range'] : 'N/A'}`);
  console.log(` -> Accept-Ranges: ${rangeRes.headers ? rangeRes.headers['accept-ranges'] : 'N/A'}`);

  process.exit(0);
}

verify().catch(console.error);
