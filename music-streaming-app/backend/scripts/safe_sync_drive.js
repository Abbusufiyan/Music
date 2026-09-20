const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../src/config/db');
const { listDriveAudioFiles } = require('../src/services/driveService');

function normalizeTitle(str) {
  if (!str) return '';
  return str
    .replace(/^\d+[\.\s\-_]*/, '') // Remove leading track numbers like "19. "
    .replace(/\.(mp3|wav|m4a|ogg|mp4|webm|flac|aac)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function cleanFilename(filename) {
  if (!filename) return '';
  return filename
    .replace(/^\d+[\.\s\-_]*/, '')
    .replace(/\.(mp3|wav|m4a|ogg|mp4|webm|flac|aac)$/i, '')
    .trim();
}

async function safeSync() {
  const isApplyMode = process.argv.includes('--apply');
  const isForceMode = process.argv.includes('--force');
  const customFolderArg = process.argv.find(arg => arg.startsWith('--folder='));
  const folderId = customFolderArg
    ? customFolderArg.split('=')[1]
    : process.env.GOOGLE_DRIVE_FOLDER_ID || '1eG72KlUDwm2d88QZtVYQlIF9RtXnSr_X';

  console.log('==================================================================');
  console.log(`  GOOGLE DRIVE SAFE SYNCHRONIZATION AUDIT (${isApplyMode ? 'APPLY MODE' : 'DRY RUN MODE'})`);
  console.log('==================================================================');
  console.log(`Target Folder ID: ${folderId}`);
  console.log(`Execution Mode:   ${isApplyMode ? 'WRITE (DB Updates Enabled)' : 'READ-ONLY (Dry Run - No DB Changes)'}`);
  console.log(`Overwrite Mode:   ${isForceMode ? 'OVERWRITE EXISTING IDs' : 'PRESERVE EXISTING IDs'}`);
  console.log('------------------------------------------------------------------\n');

  // 1. Fetch MySQL Songs
  let dbSongs = [];
  try {
    const [rows] = await pool.query('SELECT id, title, audio_url, drive_file_id FROM songs ORDER BY id ASC');
    dbSongs = rows;
    console.log(`[Database] Found ${dbSongs.length} songs in MySQL database.`);
  } catch (err) {
    console.error('[Database Error] Failed to fetch songs:', err.message);
    process.exit(1);
  }

  // 2. Scan Google Drive Folder
  console.log('[Google Drive] Scanning folder recursively...');
  const driveResult = await listDriveAudioFiles(folderId);
  const { audioFiles, foldersScanned, scannedFoldersList, errors } = driveResult;

  console.log(`[Google Drive] Scan finished. ${foldersScanned} folder(s) scanned, ${audioFiles.length} MP3 file(s) found.\n`);

  if (errors.length > 0) {
    console.warn('⚠️ Google Drive Scan Warnings/Errors:');
    errors.forEach(e => console.warn(`   - ${e}`));
    console.log('');
  }

  // Categories
  const alreadyConnected = [];
  const matchedNew = [];
  const ambiguousMatches = [];
  const unmatchedDriveFiles = [];
  const matchedDbIds = new Set();
  const matchedDriveIds = new Set();

  // 3. Match Logic
  for (const driveFile of audioFiles) {
    const driveClean = cleanFilename(driveFile.name);
    const driveNorm = normalizeTitle(driveFile.name);

    // Check if already connected by exact drive_file_id
    const existingById = dbSongs.find(s => s.drive_file_id === driveFile.id);
    if (existingById) {
      alreadyConnected.push({
        dbId: existingById.id,
        dbTitle: existingById.title,
        driveName: driveFile.name,
        driveId: driveFile.id,
        path: driveFile.folderPath,
      });
      matchedDbIds.add(existingById.id);
      matchedDriveIds.add(driveFile.id);
      continue;
    }

    // Match by normalized title against unlinked DB songs
    const potentialMatches = dbSongs.filter(s => {
      if (!isForceMode && s.drive_file_id && s.drive_file_id.trim() !== '') {
        return false; // Skip already linked songs unless --force is set
      }
      return normalizeTitle(s.title) === driveNorm || normalizeTitle(s.audio_url) === driveNorm;
    });

    if (potentialMatches.length === 1) {
      const match = potentialMatches[0];
      matchedNew.push({
        dbId: match.id,
        oldTitle: match.title,
        newTitle: driveClean,
        driveId: driveFile.id,
        driveName: driveFile.name,
        path: driveFile.folderPath,
      });
      matchedDbIds.add(match.id);
      matchedDriveIds.add(driveFile.id);
    } else if (potentialMatches.length > 1) {
      ambiguousMatches.push({
        driveName: driveFile.name,
        driveId: driveFile.id,
        candidates: potentialMatches.map(c => ({ id: c.id, title: c.title })),
      });
      matchedDriveIds.add(driveFile.id);
    } else {
      unmatchedDriveFiles.push({
        driveName: driveFile.name,
        driveId: driveFile.id,
        path: driveFile.folderPath,
      });
    }
  }

  // Unmatched DB Songs
  const unmatchedDbSongs = dbSongs.filter(s => !matchedDbIds.has(s.id));

  // 4. Print Summary Report
  console.log('==================================================================');
  console.log('                     SYNCHRONIZATION REPORT                       ');
  console.log('==================================================================');

  console.log(`\n1. ALREADY CONNECTED SONGS (${alreadyConnected.length}):`);
  if (alreadyConnected.length === 0) console.log('   - None.');
  else {
    alreadyConnected.slice(0, 10).forEach(c => {
      console.log(`   ✓ [Song ID ${c.dbId}] "${c.dbTitle}" ↔ Drive ID: ${c.driveId}`);
    });
    if (alreadyConnected.length > 10) {
      console.log(`   ... and ${alreadyConnected.length - 10} more already connected.`);
    }
  }

  console.log(`\n2. NEW MATCHED SONGS TO CONNECT (${matchedNew.length}):`);
  if (matchedNew.length === 0) console.log('   - None.');
  else {
    matchedNew.forEach(m => {
      console.log(`   + [Song ID ${m.dbId}] "${m.oldTitle}" ➔ Drive ID: ${m.driveId} ("${m.driveName}")`);
    });
  }

  console.log(`\n3. AMBIGUOUS MATCHES (${ambiguousMatches.length}):`);
  if (ambiguousMatches.length === 0) console.log('   - None.');
  else {
    ambiguousMatches.forEach(a => {
      console.log(`   ⚠️ "${a.driveName}" matches multiple DB entries: ${a.candidates.map(c => `[ID ${c.id}] ${c.title}`).join(', ')}`);
    });
  }

  console.log(`\n4. UNMATCHED DRIVE FILES (${unmatchedDriveFiles.length}):`);
  if (unmatchedDriveFiles.length === 0) console.log('   - None.');
  else {
    unmatchedDriveFiles.forEach(u => {
      console.log(`   ? "${u.path}/${u.driveName}" (Drive ID: ${u.driveId})`);
    });
  }

  console.log(`\n5. MYSQL SONGS WITHOUT DRIVE FILE (${unmatchedDbSongs.length}):`);
  if (unmatchedDbSongs.length === 0) console.log('   - None.');
  else {
    unmatchedDbSongs.forEach(u => {
      console.log(`   - [Song ID ${u.id}] "${u.title}" (drive_file_id: ${u.drive_file_id || 'NULL'})`);
    });
  }

  // 5. Database Apply Step
  if (isApplyMode) {
    if (matchedNew.length === 0) {
      console.log('\n[Apply] No new matches to update in database.');
    } else {
      console.log(`\n[Apply] Updating ${matchedNew.length} database records...`);
      for (const item of matchedNew) {
        await pool.query('UPDATE songs SET drive_file_id = ? WHERE id = ?', [item.driveId, item.dbId]);
        console.log(`   Updated Song ID ${item.dbId} with drive_file_id = ${item.driveId}`);
      }
      console.log('[Apply] Database update complete!');
    }
  } else {
    console.log('\n------------------------------------------------------------------');
    console.log('📌 THIS WAS A DRY RUN. NO DATABASE CHANGES WERE MADE.');
    console.log('To apply these matches, run:');
    console.log(`   node scripts/safe_sync_drive.js --apply --folder=${folderId}`);
    console.log('------------------------------------------------------------------');
  }

  process.exit(0);
}

safeSync().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
