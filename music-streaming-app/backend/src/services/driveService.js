const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const https = require('https');

/**
 * Initializes and returns a Google Drive API client using credentials from process.env.
 * Supports Service Account (email + private key or keyfile) and API Key authentication.
 */
function getDriveClient() {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  // Resolve keyFilePath using absolute path fallback so Service Account is always loaded regardless of process working directory
  const defaultKeyPath = path.resolve(__dirname, '../../credentials/google-service-account.json');
  let resolvedKeyPath = null;

  if (keyFilePath) {
    const candidate = path.isAbsolute(keyFilePath) ? keyFilePath : path.resolve(__dirname, '../../', keyFilePath);
    if (fs.existsSync(candidate)) {
      resolvedKeyPath = candidate;
    }
  }

  if (!resolvedKeyPath && fs.existsSync(defaultKeyPath)) {
    resolvedKeyPath = defaultKeyPath;
  }

  // 1. Service Account authentication (highest priority)
  if ((clientEmail && privateKey) || resolvedKeyPath) {
    const auth = new google.auth.GoogleAuth({
      ...(resolvedKeyPath
        ? { keyFile: resolvedKeyPath }
        : {
            credentials: {
              client_email: clientEmail,
              private_key: privateKey,
            },
          }),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    return { drive: google.drive({ version: 'v3', auth }), authType: 'service_account' };
  }

  // 2. API Key authentication
  if (apiKey) {
    return { drive: google.drive({ version: 'v3', auth: apiKey }), authType: 'api_key' };
  }

  // 3. Fallback unauthenticated client
  return { drive: google.drive({ version: 'v3' }), authType: 'none' };
}

/**
 * Helper to perform HTTP GET following redirects
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(httpGet(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

/**
 * Recursively lists all audio files inside the specified Google Drive folder ID and all its subfolders.
 * @param {string} [rootFolderId] 
 * @returns {Promise<{ audioFiles: Array<{id: string, name: string, mimeType: string, size?: string, folderPath?: string}>, foldersScanned: number, scannedFoldersList: string[], errors: string[] }>}
 */
async function listDriveAudioFiles(rootFolderId) {
  const targetFolderId = rootFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID || '1eG72KlUDwm2d88QZtVYQlIF9RtXnSr_X';
  const { drive, authType } = getDriveClient();
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  const audioMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'audio/x-m4a',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
    'audio/aac',
    'audio/x-flac',
    'audio/x-m4r',
  ];

  const audioExtRegex = /\.(mp3|wav|m4a|ogg|mp4|webm|flac|aac)$/i;

  const folderQueue = [{ id: targetFolderId, path: 'root' }];
  const audioFiles = [];
  const seenFileIds = new Set();
  const scannedFoldersList = [];
  const errors = [];
  let foldersScanned = 0;

  try {
    while (folderQueue.length > 0) {
      const currentFolder = folderQueue.shift();
      scannedFoldersList.push(currentFolder.path);
      foldersScanned++;

      const q = `'${currentFolder.id}' in parents and trashed = false`;
      const fields = 'nextPageToken, files(id, name, mimeType, size, webContentLink)';

      let pageToken = null;
      do {
        const params = {
          q,
          fields,
          pageSize: 1000,
          pageToken: pageToken || undefined,
        };
        if (authType === 'none' && apiKey) {
          params.key = apiKey;
        }

        const res = await drive.files.list(params);
        const files = res.data.files || [];
        pageToken = res.data.nextPageToken || null;

        for (const f of files) {
          if (f.mimeType === 'application/vnd.google-apps.folder') {
            folderQueue.push({
              id: f.id,
              path: `${currentFolder.path}/${f.name}`,
            });
          } else {
            const isAudioMime = audioMimeTypes.includes(f.mimeType?.toLowerCase());
            const isAudioExt = audioExtRegex.test(f.name || '');

            if ((isAudioMime || isAudioExt) && !seenFileIds.has(f.id)) {
              seenFileIds.add(f.id);
              audioFiles.push({
                id: f.id,
                name: f.name,
                mimeType: f.mimeType || 'audio/mpeg',
                size: f.size,
                folderPath: currentFolder.path,
              });
            }
          }
        }
      } while (pageToken);
    }
  } catch (err) {
    errors.push(`Google Drive API: ${err.message}`);
    console.warn(`Drive API listing warning for folder ${targetFolderId}:`, err.message);
  }

  return {
    audioFiles,
    foldersScanned,
    scannedFoldersList,
    errors,
  };
}

/**
 * Retrieves a readable stream for a Google Drive file by ID.
 * Supports range requests for HTML5 seeking.
 * @param {string} fileId 
 * @param {object} [headers] Optional incoming request headers (for Range header)
 */
async function getDriveFileStream(fileId, headers = {}) {
  const { drive, authType } = getDriveClient();
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  const params = { fileId, alt: 'media' };
  if (authType === 'none' && apiKey) {
    params.key = apiKey;
  }

  const reqOptions = {
    responseType: 'stream',
    headers: {},
  };

  if (headers.range || headers.Range) {
    reqOptions.headers['Range'] = headers.range || headers.Range;
  }

  const response = await drive.files.get(params, reqOptions);

  const resHeaders = {};
  if (response.headers) {
    if (typeof response.headers.forEach === 'function') {
      response.headers.forEach((val, key) => {
        resHeaders[key.toLowerCase()] = val;
      });
    } else if (typeof response.headers === 'object') {
      Object.keys(response.headers).forEach(key => {
        resHeaders[key.toLowerCase()] = response.headers[key];
      });
    }
  }

  return {
    stream: response.data,
    status: response.status,
    headers: resHeaders,
  };
}

module.exports = {
  getDriveClient,
  listDriveAudioFiles,
  getDriveFileStream,
};
