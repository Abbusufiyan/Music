/**
 * Request Validation Middleware
 * Validates request payload data before passing control to controllers.
 */

function validateRegister(req, res, next) {
  const { username, email, password } = req.body || {};
  const details = [];
  const errors = [];

  if (!username || typeof username !== 'string' || username.trim().length < 1 || username.trim().length > 50) {
    const msg = 'Username must be between 1 and 50 characters long';
    details.push(msg);
    errors.push({ field: 'username', message: msg });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    const msg = 'A valid email address is required';
    details.push(msg);
    errors.push({ field: 'email', message: msg });
  }

  if (!password || typeof password !== 'string' || password.length < 4 || password.length > 100) {
    const msg = 'Password must be between 4 and 100 characters long';
    details.push(msg);
    errors.push({ field: 'password', message: msg });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: errors[0].message,
      errors: errors,
      details: details
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const loginId = req.body?.username || req.body?.email;
  const { password } = req.body || {};
  const details = [];
  const errors = [];

  if (!loginId || typeof loginId !== 'string' || !loginId.trim()) {
    const msg = 'Username or email is required';
    details.push(msg);
    errors.push({ field: 'username', message: msg });
  }

  if (!password || typeof password !== 'string' || !password || password.length < 4 || password.length > 100) {
    const msg = 'Password must be between 4 and 100 characters long';
    details.push(msg);
    errors.push({ field: 'password', message: msg });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: errors[0].message,
      errors: errors,
      details: details
    });
  }

  next();
}

function validatePlaylist(req, res, next) {
  const { name } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Playlist name is required and must be a non-empty string'
    });
  }

  next();
}

function validatePlaylistSong(req, res, next) {
  const { songId } = req.body || {};

  if (songId === undefined || songId === null || String(songId).trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'songId is required'
    });
  }

  next();
}

function validateProfileUpdate(req, res, next) {
  const { name, bio, avatarUrl } = req.body || {};

  if (name !== undefined && typeof name !== 'string') {
    return res.status(400).json({ success: false, error: 'Name must be a string' });
  }

  if (bio !== undefined && typeof bio !== 'string') {
    return res.status(400).json({ success: false, error: 'Bio must be a string' });
  }

  if (avatarUrl !== undefined && typeof avatarUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'Avatar URL must be a string' });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validatePlaylist,
  validatePlaylistSong,
  validateProfileUpdate
};
