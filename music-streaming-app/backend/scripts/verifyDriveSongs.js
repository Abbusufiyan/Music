const pool = require('../src/config/db');
const http = require('http');

async function testDriveStream() {
  console.log('========================================');
  console.log('VERIFYING IMPORTED GOOGLE DRIVE SONGS');
  console.log('========================================\n');

  // Query database songs with drive_file_id
  const [songs] = await pool.query('SELECT id, title, drive_file_id, audio_url FROM songs WHERE drive_file_id IS NOT NULL ORDER BY id ASC');
  
  console.log(`Total Database Songs with drive_file_id: ${songs.length}\n`);

  console.log('Sample Imported Google Drive Songs:');
  songs.slice(0, 10).forEach(s => {
    console.log(` - ID ${s.id}: "${s.title}" | Drive ID: ${s.drive_file_id} | Stream: ${s.audio_url}`);
  });

  console.log('\n--- TESTING HTTP RANGE REQUEST ON DRIVE SONG (ID 16) ---');

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
        let size = 0;
        res.on('data', chunk => size += chunk.length);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            bytesReceived: size
          });
        });
      });
      req.on('error', (e) => resolve({ statusCode: 500, error: e.message }));
      req.end();
    });
  }

  const rangeRes = await testStreamRequest(16, { Range: 'bytes=0-1023' });
  console.log(`Status Code: ${rangeRes.statusCode}`);
  console.log(`Content-Type: ${rangeRes.headers['content-type']}`);
  console.log(`Content-Range: ${rangeRes.headers['content-range']}`);
  console.log(`Content-Length: ${rangeRes.headers['content-length']}`);
  console.log(`Accept-Ranges: ${rangeRes.headers['accept-ranges']}`);
  console.log(`Bytes Received: ${rangeRes.bytesReceived}`);

  process.exit(0);
}

testDriveStream().catch(console.error);
