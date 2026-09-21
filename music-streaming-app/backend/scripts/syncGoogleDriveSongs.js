const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../src/config/db');
const { listDriveAudioFiles } = require('../src/services/driveService');

function normalizeTitle(title) {
  if (!title) return '';
  return title
    .replace(/\.(mp3|wav|m4a|ogg|mp4|webm|flac|aac)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function cleanTitle(filename) {
  if (!filename) return '';
  return filename.replace(/\.(mp3|wav|m4a|ogg|mp4|webm|flac|aac)$/i, '').trim();
}

async function runSync() {
  console.log('==================================================');
  console.log('  STARTING RECURSIVE GOOGLE DRIVE SONG SYNC');
  console.log('==================================================');

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1eG72KlUDwm2d88QZtVYQlIF9RtXnSr_X';
  console.log(`Root Google Drive Folder ID: ${folderId}`);

  // 1. Database Schema Migration: Ensure drive_file_id column exists
  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM songs LIKE "drive_file_id"');
    if (cols.length === 0) {
      console.log('Adding "drive_file_id" column to "songs" table...');
      await pool.query('ALTER TABLE songs ADD COLUMN drive_file_id VARCHAR(255) NULL AFTER duration');
      console.log('Column "drive_file_id" added successfully.');
    } else {
      console.log('Database column "drive_file_id" is present.');
    }
  } catch (colErr) {
    console.warn('Column migration check:', colErr.message);
  }

  // 2. Query existing songs from MySQL database
  let dbSongs = [];
  try {
    const [rows] = await pool.query('SELECT * FROM songs ORDER BY id ASC');
    dbSongs = rows;
    console.log(`Fetched ${dbSongs.length} existing songs from database.`);
  } catch (dbErr) {
    console.error('Failed to query songs from database:', dbErr.message);
    process.exit(1);
  }

  // 3. Perform Recursive Drive API scan
  console.log('\nScanning Google Drive folder recursively...');
  const driveResult = await listDriveAudioFiles(folderId);
  const { audioFiles, foldersScanned, scannedFoldersList, errors } = driveResult;

  console.log(`\nScan complete:`);
  console.log(` -> Folders scanned: ${foldersScanned}`);
  console.log(` -> Total audio files found: ${audioFiles.length}`);

  const matchedSongs = [];
  const newSongsCreated = [];
  const duplicateIgnored = [];
  const matchedDbSongIds = new Set();
  const processedDriveFileIds = new Set();

  // 4. Synchronize each discovered audio file
  if (audioFiles.length > 0) {
    for (const driveFile of audioFiles) {
      // Idempotency check: Skip if this exact Drive File ID was already processed in this run
      if (processedDriveFileIds.has(driveFile.id)) {
        duplicateIgnored.push({ driveFileId: driveFile.id, name: driveFile.name, reason: 'Duplicate Drive File ID in scan' });
        continue;
      }
      processedDriveFileIds.add(driveFile.id);

      const driveTitleClean = cleanTitle(driveFile.name);
      const normDrive = normalizeTitle(driveFile.name);

      // 1) First check: Match by drive_file_id if already linked in DB
      let dbMatch = dbSongs.find(s => s.drive_file_id === driveFile.id);

      // 2) Second check: Match by normalized title if not linked yet
      if (!dbMatch) {
        dbMatch = dbSongs.find(s => !matchedDbSongIds.has(s.id) && normalizeTitle(s.title) === normDrive);
      }

      if (dbMatch) {
        matchedDbSongIds.add(dbMatch.id);
        const streamUrl = `/api/songs/${dbMatch.id}/stream`;

        await pool.query(
          'UPDATE songs SET title = ?, drive_file_id = ?, audio_url = ? WHERE id = ?',
          [driveTitleClean, driveFile.id, streamUrl, dbMatch.id]
        );

        matchedSongs.push({
          driveFileName: driveFile.name,
          folderPath: driveFile.folderPath,
          dbSongId: dbMatch.id,
          oldTitle: dbMatch.title,
          newTitle: driveTitleClean,
          driveFileId: driveFile.id,
        });
      } else {
        // 3) Genuinely new Drive song: Insert safely into database without duplicating existing records
        try {
          const defaultArtistId = dbSongs[0]?.artist_id || 1;
          const defaultAlbumId = dbSongs[0]?.album_id || 1;
          const defaultCover = dbSongs[0]?.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';

          const [insertRes] = await pool.query(
            'INSERT INTO songs (title, artist_id, album_id, audio_url, cover_url, duration, drive_file_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [driveTitleClean, defaultArtistId, defaultAlbumId, 'pending', 'temp', 180, driveFile.id]
          );

          const newSongId = insertRes.insertId;
          const streamUrl = `/api/songs/${newSongId}/stream`;
          const songCoverUrl = `/api/images/song/${newSongId}`;
          await pool.query('UPDATE songs SET audio_url = ?, cover_url = ? WHERE id = ?', [streamUrl, songCoverUrl, newSongId]);

          // Keep local DB songs cache updated for subsequent file comparisons
          dbSongs.push({
            id: newSongId,
            title: driveTitleClean,
            artist_id: defaultArtistId,
            album_id: defaultAlbumId,
            audio_url: streamUrl,
            drive_file_id: driveFile.id,
          });

          newSongsCreated.push({
            driveFileName: driveFile.name,
            folderPath: driveFile.folderPath,
            newSongId,
            title: driveTitleClean,
            driveFileId: driveFile.id,
          });
        } catch (insErr) {
          errors.push(`Failed to insert new song "${driveFile.name}": ${insErr.message}`);
          console.error(`Failed to insert new song "${driveFile.name}":`, insErr.message);
        }
      }
    }
  } else {
    // If 0 files found (e.g. unauthenticated API call), ensure existing DB songs retain valid stream endpoint URLs
    console.log('Ensuring stream endpoint URLs for existing DB songs...');
    for (const s of dbSongs) {
      const streamUrl = `/api/songs/${s.id}/stream`;
      if (!s.audio_url || !s.audio_url.includes('/stream')) {
        await pool.query('UPDATE songs SET audio_url = ? WHERE id = ?', [streamUrl, s.id]);
      }
    }
  }

  // 5. Identify DB songs without a Drive match
  const dbSongsWithoutDriveMatch = dbSongs.filter(s => !matchedDbSongIds.has(s.id) && !newSongsCreated.some(n => n.newSongId === s.id));

  // 6. Output Enhanced Synchronization Report
  console.log('\n==================================================');
  console.log('        GOOGLE DRIVE SYNCHRONIZATION REPORT');
  console.log('==================================================');

  console.log(`\n1. SCOPE & DISCOVERY:`);
  console.log(` - Folders Scanned: ${foldersScanned}`);
  console.log(` - Scanned Folders: ${scannedFoldersList.join(', ')}`);
  console.log(` - Audio Files Found: ${audioFiles.length}`);

  console.log(`\n2. MATCHED SONGS (${matchedSongs.length}):`);
  if (matchedSongs.length === 0) {
    console.log(' - None.');
  } else {
    matchedSongs.forEach(m => {
      console.log(` - [ID ${m.dbSongId}] "${m.folderPath}/${m.driveFileName}" -> Title: "${m.newTitle}" | Drive ID: ${m.driveFileId}`);
    });
  }

  console.log(`\n3. NEW SONGS CREATED (${newSongsCreated.length}):`);
  if (newSongsCreated.length === 0) {
    console.log(' - None.');
  } else {
    newSongsCreated.forEach(n => {
      console.log(` - [New ID ${n.newSongId}] "${n.folderPath}/${n.driveFileName}" -> Title: "${n.title}" | Drive ID: ${n.driveFileId}`);
    });
  }

  console.log(`\n4. PRESERVED DATABASE SONGS WITHOUT DRIVE MATCH (${dbSongsWithoutDriveMatch.length}):`);
  if (dbSongsWithoutDriveMatch.length === 0) {
    console.log(' - None.');
  } else {
    dbSongsWithoutDriveMatch.forEach(s => {
      console.log(` - [ID ${s.id}] "${s.title}" (Stream URL: /api/songs/${s.id}/stream)`);
    });
  }

  console.log(`\n5. DUPLICATES / IGNORED FILES (${duplicateIgnored.length}):`);
  if (duplicateIgnored.length === 0) {
    console.log(' - None.');
  } else {
    duplicateIgnored.forEach(d => {
      console.log(` - "${d.name}" (ID: ${d.driveFileId}) - ${d.reason}`);
    });
  }

  console.log(`\n6. ERRORS / WARNINGS (${errors.length}):`);
  if (errors.length === 0) {
    console.log(' - None.');
  } else {
    errors.forEach(e => {
      console.log(` - ${e}`);
    });
  }

  console.log('\n==================================================');
  console.log('  RECURSIVE SYNCHRONIZATION COMPLETED');
  console.log('==================================================\n');

  process.exit(0);
}

runSync().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
