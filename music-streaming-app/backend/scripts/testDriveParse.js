const https = require('https');
const fs = require('fs');

function get(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
  });
}

async function test() {
  const folderId = '1eG72KlUDwm2d88QZtVYQlIF9RtXnSr_X';
  const res = await get(`https://drive.google.com/drive/folders/${folderId}`);
  console.log('Folder status:', res.status, 'Body length:', res.data.length);

  // Search for filenames ending in .mp3, .wav, .m4a, .ogg, .mp4, .webm
  const fnRegex = /"([^"]+\.(?:mp3|wav|m4a|ogg|mp4|webm|flac))"/gi;
  let fnMatch;
  const filenames = new Set();
  while ((fnMatch = fnRegex.exec(res.data)) !== null) {
    filenames.add(fnMatch[1]);
  }
  console.log('Filenames found:', Array.from(filenames));

  // Search for file ID patterns: 28-35 char alphanumeric strings containing _ or -
  // In Google Drive HTML init data, items often look like: ["<ID>", ["<filename>", ...
  const matches = [];
  const idAndNameRegex = /\["([a-zA-Z0-9_-]{28,35})",\["([^"]+)"/g;
  let m;
  while ((m = idAndNameRegex.exec(res.data)) !== null) {
    matches.push({ id: m[1], name: m[2] });
  }
  console.log('ID + Name matches:', matches);
}

test();
