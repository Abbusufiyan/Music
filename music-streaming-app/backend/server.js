const app = require('./src/app');
const dotenv = require('dotenv');
const path = require('path');
const pool = require('./src/config/db');

dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 3000;

async function syncNfakArtistMappings() {
  try {
    const [artists] = await pool.query(
      "SELECT id, name FROM artists WHERE LOWER(name) LIKE '%nusrat%' OR LOWER(name) LIKE '%nfak%' LIMIT 1"
    );
    let nfakArtistId = artists[0]?.id;

    if (!nfakArtistId) {
      const [ins] = await pool.query(
        "INSERT INTO artists (name, image_url) VALUES ('Nusrat Fateh Ali Khan', '/api/images/artist/nusrat-fateh-ali-khan')"
      );
      nfakArtistId = ins.insertId;
    }

    if (nfakArtistId) {
      const nfakTitles = [
        "Barsoon Kay Intizar Ka",
        "Sat Asmana De Tale",
        "Husn Walon Se Allah Bachaye",
        "Un Ka Andaz-E-Karam",
        "Aisa Banna Sanwarna",
        "Na To Caravan Ki Talash",
        "Biba Sada Dil Morr De",
        "Sanson Ki Mala Pe",
        "Tumhen Dillagi",
        "Dil Pe Zakham Khate",
        "Halka Halka Saroor",
        "Aisa Bana Sanwarna",
        "Tum Agar Yuhin Nazren",
        "Hae Kahan Ka Irada",
        "Hai Kahan Ka Irada"
      ];

      for (const title of nfakTitles) {
        await pool.query("UPDATE songs SET artist_id = ? WHERE title LIKE ?", [nfakArtistId, `%${title}%`]);
      }
      console.log(`[DB MIGRATION] Nusrat Fateh Ali Khan songs updated to artist_id = ${nfakArtistId}`);
    }
  } catch (err) {
    console.warn('[DB MIGRATION WARNING]', err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  await syncNfakArtistMappings();
});

