import { apiClient } from './apiClient';

export const authService = {
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
  register: (username, email, password) => apiClient.post('/auth/register', { username, email, password }),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

export const songService = {
  getSongs: () => apiClient.get('/songs').then(res => res.data || res),
  searchSongs: (q) => apiClient.get(`/songs/search?q=${encodeURIComponent(q)}`),
};

export const playlistService = {
  getPlaylists: () => apiClient.get('/playlists'),
  createPlaylist: (name, description) => apiClient.post('/playlists', { name, description }),
  updatePlaylist: (id, name, description) => apiClient.put(`/playlists/${id}`, { name, description }),
  deletePlaylist: (id) => apiClient.del(`/playlists/${id}`),
  addSong: (playlistId, songId) => apiClient.post(`/playlists/${playlistId}/songs`, { songId }),
  removeSong: (playlistId, songId) => apiClient.del(`/playlists/${playlistId}/songs/${songId}`),
};

export const likeService = {
  getLikes: () => apiClient.get('/likes'),
  likeSong: (songId) => apiClient.post(`/likes/${songId}`),
  unlikeSong: (songId) => apiClient.del(`/likes/${songId}`),
};

export const activityService = {
  getActivities: () => apiClient.get('/activities'),
  addActivity: (message, image) => apiClient.post('/activities', { message, image }),
};
