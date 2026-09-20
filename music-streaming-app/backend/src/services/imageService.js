const fs = require('fs');
const path = require('path');
const { getDriveClient, getDriveFileStream } = require('./driveService');

const LOCAL_SONG_IMG_DIR = '/home/omr/Desktop/song_research/song_images';
const LOCAL_ARTIST_IMG_DIR = '/home/omr/Desktop/song_research/artist_images';
const LOCAL_HOME_IMG_DIR = '/home/omr/Desktop/song_research/img';

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

  // 2. Scan Local Fallback Desktop directories
  const scanLocalDir = (dirPath, targetObj) => {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
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

  driveImageCache = {
    songImages,
    artistImages,
    homeImages,
    lastScanned: Date.now()
  };

  return driveImageCache;
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

  // 2. Multi-image rotation for Nusrat Fateh Ali Khan songs/artists
  if (!item && (searchKey.includes('nusrat') || searchKey.includes('nfak') || /^(3[5-9]|4[0-9]|50)$/.test(searchKey))) {
    const nfakImages = Object.values(catalog).filter(i => i.name.toLowerCase().includes('nusrat'));
    if (nfakImages.length > 0) {
      const numericId = parseInt(searchKey.replace(/\D/g, ''), 10) || 0;
      item = nfakImages[numericId % nfakImages.length];
    }
  }

  // 3. Fuzzy match by searchKey across specified catalog or homeImages fallback
  if (!item) {
    const cleanKey = searchKey
      .replace(/^[0-9]+\.\s*/, '')
      .replace(/aa/g, 'a')
      .replace(/[^a-z0-9]/g, '');

    let entry = Object.values(catalog).find(i => {
      const iClean = i.name
        .toLowerCase()
        .replace(/\.(jpeg|jpg|png|webp)$/i, '')
        .replace(/by.*$/i, '')
        .replace(/aa/g, 'a')
        .replace(/[^a-z0-9]/g, '');
      return iClean.includes(cleanKey) || cleanKey.includes(iClean);
    });
    if (!entry && category !== 'home') {
      entry = Object.values(driveImageCache.homeImages).find(i => {
        const iClean = i.name
          .toLowerCase()
          .replace(/\.(jpeg|jpg|png|webp)$/i, '')
          .replace(/aa/g, 'a')
          .replace(/[^a-z0-9]/g, '');
        return iClean.includes(cleanKey) || cleanKey.includes(iClean);
      });
    }
    if (entry) item = entry;
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

