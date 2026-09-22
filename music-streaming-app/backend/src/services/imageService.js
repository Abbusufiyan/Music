const fs = require('fs');
const path = require('path');
const { getDriveClient, getDriveFileStream } = require('./driveService');

const LOCAL_SONG_IMG_DIR = '/home/omr/Desktop/song_research/song_images';
const LOCAL_ARTIST_IMG_DIR = '/home/omr/Desktop/song_research/artist_images';
const LOCAL_HOME_IMG_DIR = '/home/omr/Desktop/song_research/img';
const BUNDLED_FRONTEND_IMG_DIR = path.resolve(__dirname, '../../../../frontend/public/images');
const BUNDLED_BACKEND_IMG_DIR = path.resolve(__dirname, '../../../frontend/public/images');

// Cache for Drive & Local file mappings
let driveImageCache = {
  songImages: {},   // filename/songId -> driveFileId/path
  artistImages: {}, // filename/artistId -> driveFileId/path
  homeImages: {},   // filename/category -> driveFileId/path
  lastScanned: 0
};

/**
 * Scan Google Drive & Local directories for song_images, artist_images, and home/cover images.
 */
async function scanDriveImages() {
  const { drive } = getDriveClient();
  const songImages = {};
  const artistImages = {};
  const homeImages = {};

  // 1. Scan Google Drive for folders named song_img, song_images, artist_images, img, cover images
  try {
    const folderRes = await drive.files.list({
      q: "(name = 'song_img' or name = 'song_images' or name = 'artist_images' or name = 'img' or name = 'cover images' or name = 'album images' or name = 'playlist images') and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: 'files(id, name, parents)'
    });

    const folders = folderRes.data.files || [];
    for (const f of folders) {
      const lowerName = f.name.toLowerCase();
      const filesRes = await drive.files.list({
        q: `'${f.id}' in parents and trashed = false`,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        fields: 'files(id, name, mimeType, size)'
      });

      (filesRes.data.files || []).forEach(file => {
        if (file.mimeType && file.mimeType.startsWith('image/')) {
          const item = { id: file.id, name: file.name, mimeType: file.mimeType, size: file.size, isDrive: true };
          if (lowerName.includes('song')) songImages[file.name.toLowerCase()] = item;
          if (lowerName.includes('artist')) artistImages[file.name.toLowerCase()] = item;
          homeImages[file.name.toLowerCase()] = item;
        }
      });
    }
  } catch (err) {
    console.warn('Google Drive image scan notice:', err.message);
  }

  // 2. Scan Local Fallback Desktop & Bundled directories
  const scanLocalDir = (dirPath, targetObj) => {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) return;
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      if (ext === '.webp') mimeType = 'image/webp';
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      targetObj[file.toLowerCase()] = {
        name: file,
        filePath: fullPath,
        mimeType,
        size: stat.size,
        isLocal: true
      };
    });
  };

  scanLocalDir(LOCAL_SONG_IMG_DIR, songImages);
  scanLocalDir(LOCAL_ARTIST_IMG_DIR, artistImages);
  scanLocalDir(LOCAL_HOME_IMG_DIR, homeImages);
  scanLocalDir(BUNDLED_FRONTEND_IMG_DIR, songImages);
  scanLocalDir(BUNDLED_BACKEND_IMG_DIR, songImages);

  driveImageCache = {
    songImages,
    artistImages,
    homeImages,
    lastScanned: Date.now()
  };

  return driveImageCache;
}

/**
 * Deterministic hash helper for string mapping
 */
function hashString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get Image metadata or stream for song / artist / home / drive file.
 */
async function getImageStream(category, key) {
  if (Date.now() - driveImageCache.lastScanned > 60000) {
    await scanDriveImages();
  }

  let catalog = driveImageCache.songImages;
  if (category === 'artist') catalog = driveImageCache.artistImages;
  if (category === 'home') catalog = driveImageCache.homeImages;

  const searchKey = String(key).toLowerCase();

  // 1. Direct filename match
  let item = catalog[searchKey];

  // 2. Artist-specific alias resolution
  if (!item && category === 'artist') {
    const artistAliasMap = {
      'ar rahman': 'ar rahman.jpeg',
      'ar-rahman': 'ar rahman.jpeg',
      'a.r. rahman': 'ar rahman.jpeg',
      'a.r. rahman / mohit chauhan': 'ar rahman.jpeg',
      'atif aslam': 'atif-aslam.jpeg',
      'atif-aslam': 'atif-aslam.jpeg',
      'arijit singh': 'arijit_singh.jpeg',
      'arijit-singh': 'arijit_singh.jpeg',
      'nusrat fateh ali khan': 'nusrat fateh ali khan.jpeg',
      'nusrat-fateh-ali-khan': 'nusrat fateh ali khan.jpeg',
      'ustad nusrat fateh ali khan': 'nusrat fateh ali khan.jpeg',
      'nfak': 'nusrat fateh ali khan.jpeg',
      'anuv jain': 'anuv-jain.jpeg',
      'anuv-jain': 'anuv-jain.jpeg',
      'javed ali': 'javed ali.jpeg',
      'javed-ali': 'javed ali.jpeg',
      'mohamad rafi': 'mohamad rafi _.jpeg',
      'mohamad-rafi': 'mohamad rafi _.jpeg',
      'mohammed rafi': 'mohamad rafi _.jpeg',
      'mohammed-rafi': 'mohamad rafi _.jpeg',
      'sonu nigam': 'sonu migum.webp',
      'sonu-nigam': 'sonu migum.webp',
      'sonu migum': 'sonu migum.webp',
      'dua': 'dua.jpeg',
      'dua lipa': 'dua.jpeg',
      'dua-lipa': 'dua.jpeg',
      'kk': 'kk.jpeg'
    };
    if (artistAliasMap[searchKey]) {
      item = catalog[artistAliasMap[searchKey]];
    }
  }

  // 3. Strict Title Matching for Songs
  if (!item) {
    const rawClean = searchKey.replace(/^[0-9]+\.\s*/, '').trim();
    const cleanNorm = rawClean.replace(/aa/g, 'a').replace(/[^a-z0-9]/g, '');

    if (cleanNorm.length >= 2) {
      let entry = Object.values(catalog).find(i => {
        const baseName = i.name.toLowerCase().replace(/\.(jpeg|jpg|png|webp)$/i, '');
        // Extract song title portion before 'by' or '-by-'
        const songPart = baseName.split(/[-_\s]+by[-_\s]+/i)[0].split(/by[-_\s]+/i)[0];
        const songNorm = songPart.replace(/aa/g, 'a').replace(/[^a-z0-9]/g, '');
        return songNorm === cleanNorm || (songNorm.length >= 3 && cleanNorm.length >= 3 && songNorm === cleanNorm);
      });

      // Secondary fallback within same catalog if exact songPart match missed
      if (!entry) {
        entry = Object.values(catalog).find(i => {
          const iClean = i.name
            .toLowerCase()
            .replace(/\.(jpeg|jpg|png|webp)$/i, '')
            .replace(/by.*$/i, '')
            .replace(/aa/g, 'a')
            .replace(/[^a-z0-9]/g, '');
          return (iClean.length >= 3 && cleanNorm.length >= 3 && (iClean === cleanNorm || cleanNorm.startsWith(iClean)));
        });
      }

      if (entry) item = entry;
    }
  }

  // 4. Deterministic Multi-Image Selection for NFAK / Nusrat Songs if specific title file is un-named
  if (!item) {
    const nfakImages = Object.values(catalog).filter(i => {
      const name = i.name.toLowerCase();
      return name.includes('nusrat') || name.includes('nfak');
    });

    if (nfakImages.length > 0) {
      const selectedIndex = hashString(searchKey) % nfakImages.length;
      item = nfakImages[selectedIndex];
    }
  }

  if (!item) {
    return null;
  }

  if (item.isLocal && fs.existsSync(item.filePath)) {
    return {
      stream: fs.createReadStream(item.filePath),
      mimeType: item.mimeType,
      size: item.size
    };
  }

  if (item.isDrive && item.id) {
    const driveRes = await getDriveFileStream(item.id);
    return {
      stream: driveRes.stream,
      mimeType: item.mimeType || 'image/jpeg',
      size: item.size
    };
  }

  return null;
}

module.exports = {
  scanDriveImages,
  getImageStream,
  getDriveImageCache: () => driveImageCache
};
