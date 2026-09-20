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
  fs.writeFileSync('drive_dump.html', res.data);
  console.log('Saved drive_dump.html. Length:', res.data.length);

  // Search for AF_initDataCallback functions
  const cbMatches = res.data.match(/AF_initDataCallback\(\{[\s\S]*?\}\);/g);
  console.log('AF_initDataCallback count:', cbMatches ? cbMatches.length : 0);
  if (cbMatches) {
    cbMatches.forEach((m, idx) => {
      console.log(`--- Callback ${idx} (len: ${m.length}) ---`);
      if (m.length > 500) {
        fs.writeFileSync(`cb_${idx}.js`, m);
        console.log(`Saved cb_${idx}.js`);
      }
    });
  }
}

test();
