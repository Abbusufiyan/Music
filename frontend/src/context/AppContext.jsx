import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ALL_SONGS as FALLBACK_SONGS } from '../data/musicData'
import { authService, songService, playlistService, likeService, activityService } from '../api/services'
import { getToken, setToken, resolveApiUrl } from '../api/apiClient'
import SONGS_META from '../../../music-assets/songs.json'

const AppContext = createContext(null)

const INITIAL_PROFILE = {
  name: 'OMR',
  username: '@omrmusic',
  bio: 'Music is better when shared.',
  avatarUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200&h=200'
}

const SONG_META_MAP = new Map()
if (Array.isArray(SONGS_META)) {
  SONGS_META.forEach(meta => {
    if (meta.song_name) {
      const key = meta.song_name.toLowerCase().trim()
      SONG_META_MAP.set(key, meta)
    }
  })
}

export function formatSongObject(s) {
  if (!s) return s;
  const id = String(s.id);
  let audioUrl = s.audioUrl || s.audio_url;

  if (
    !audioUrl ||
    audioUrl.includes('drive.google.com') ||
    audioUrl.includes('/view') ||
    s.driveFileId ||
    s.drive_file_id ||
    Number(id) >= 16
  ) {
    audioUrl = `/api/songs/${id}/stream`;
  }

  let rawTitle = s.title || 'Untitled Track';
  const cleanTitle = rawTitle.replace(/^\d+\.\s*/, '').trim();

  const meta = SONG_META_MAP.get(cleanTitle.toLowerCase());

  const artist = (meta && meta.artist_name) ? meta.artist_name : (s.artist || 'Google Drive Music');
  const album = (meta && meta.album_name) ? meta.album_name : (s.albumName || s.album || 'Drive Album');

  // Enforce unique song artwork endpoint per actual song ID
  let artwork = s.artwork || s.cover_url || s.cover;
  if (!artwork || artwork.includes('unsplash.com') || artwork.includes('/api/images/')) {
    artwork = `/api/images/song/${id}`;
  }

  return {
    ...s,
    id,
    title: cleanTitle || rawTitle,
    artist,
    album,
    duration: Number(s.duration) || 180,
    artwork: resolveApiUrl(artwork),
    audioUrl: resolveApiUrl(audioUrl),
  };
}

export function AppProvider({ children }) {
  const audioRef = useRef(null)

  const [activeNav, setActiveNav] = useState('Home')
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [library, setLibrary] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)

  const [allSongs, setAllSongs] = useState(FALLBACK_SONGS)
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [playlistQueue, setPlaylistQueue] = useState(FALLBACK_SONGS)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false)
  const autoMinimizeTimerRef = useRef(null)

  const expandPlayer = useCallback(() => {
    setIsPlayerExpanded(true)
  }, [])

  const minimizePlayer = useCallback(() => {
    setIsPlayerExpanded(false)
  }, [])

  const togglePlayerExpanded = useCallback(() => {
    setIsPlayerExpanded((prev) => !prev)
  }, [])

  // Auto-minimize expanded player after 6 seconds on non-Songs pages
  useEffect(() => {
    if (activeNav === 'Songs') {
      setIsPlayerExpanded(true)
      if (autoMinimizeTimerRef.current) clearTimeout(autoMinimizeTimerRef.current)
      return
    }

    if (isPlayerExpanded && currentSong) {
      if (autoMinimizeTimerRef.current) clearTimeout(autoMinimizeTimerRef.current)
      autoMinimizeTimerRef.current = setTimeout(() => {
        setIsPlayerExpanded(false)
      }, 6000)
    }

    return () => {
      if (autoMinimizeTimerRef.current) clearTimeout(autoMinimizeTimerRef.current)
    }
  }, [isPlayerExpanded, currentSong, activeNav])

  // Automatically expand player when a new track starts playing
  useEffect(() => {
    if (currentSong) {
      setIsPlayerExpanded(true)
    }
  }, [currentSong?.id])

  // -- PERSISTENCE + REACTIVE STATE --
  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('playlists') || localStorage.getItem('app_playlists')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('likedSongs') || localStorage.getItem('app_likedSongs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [recentActivity, setRecentActivity] = useState(() => {
    try {
      const saved = localStorage.getItem('recentActivity') || localStorage.getItem('app_recentActivity')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('userProfile') || localStorage.getItem('app_userProfile')
      return saved ? JSON.parse(saved) : INITIAL_PROFILE
    } catch {
      return INITIAL_PROFILE
    }
  })

  // Sync state to LocalStorage (both 'playlists' and 'app_playlists' for compatibility)
  useEffect(() => {
    try {
      const serialized = JSON.stringify(playlists)
      localStorage.setItem('playlists', serialized)
      localStorage.setItem('app_playlists', serialized)
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
  }, [playlists])

  useEffect(() => {
    try {
      const serialized = JSON.stringify(likedSongs)
      localStorage.setItem('likedSongs', serialized)
      localStorage.setItem('app_likedSongs', serialized)
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
  }, [likedSongs])

  useEffect(() => {
    try {
      const serialized = JSON.stringify(recentActivity)
      localStorage.setItem('recentActivity', serialized)
      localStorage.setItem('app_recentActivity', serialized)
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
  }, [recentActivity])

  useEffect(() => {
    try {
      const serialized = JSON.stringify(userProfile)
      localStorage.setItem('userProfile', serialized)
      localStorage.setItem('app_userProfile', serialized)
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
  }, [userProfile])

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  // 1. Fetch songs from backend on mount if available, merging with FALLBACK_SONGS
  useEffect(() => {
    songService.getSongs()
      .then((res) => {
        const songsData = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(songsData) && songsData.length > 0) {
          const formatted = songsData.map(formatSongObject);

          const merged = [...formatted];
          FALLBACK_SONGS.forEach(fs => {
            if (!merged.some(ms => String(ms.id) === String(fs.id))) {
              merged.push(formatSongObject(fs));
            }
          });

          setAllSongs(merged);
          setPlaylistQueue(merged);
        }
      })
      .catch((err) => {
        console.warn('Backend offline or unavailable, using local music data.', err);
      });
  }, []);

  // 2. Initial Auth Restoration & Token Verification on App Launch
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      setAuthLoading(false);
      return;
    }

    authService.getMe()
      .then((me) => {
        if (me) {
          setIsAuthenticated(true);
          setUserProfile(prev => ({
            ...prev,
            id: me.id,
            username: me.username ? (me.username.startsWith('@') ? me.username : `@${me.username}`) : prev.username,
            name: me.name || me.username || prev.name,
            bio: me.bio || prev.bio,
            avatarUrl: me.avatarUrl || prev.avatarUrl
          }));
        } else {
          setToken(null);
          setIsAuthenticated(false);
        }
      })
      .catch((err) => {
        console.warn('Initial token verification failed:', err);
        setToken(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // 3. Load user playlists, likes, and activities when token is present
  const refreshUserData = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const pl = await playlistService.getPlaylists();
      if (Array.isArray(pl) && pl.length > 0) {
        setPlaylists(prev => {
          const merged = [...prev];
          pl.forEach(p => {
            const formatted = {
              ...p,
              id: String(p.id),
              songIds: p.songIds ? p.songIds.map(String) : []
            };
            const idx = merged.findIndex(m => String(m.id) === String(formatted.id));
            if (idx >= 0) {
              const combinedSongIds = Array.from(new Set([
                ...(merged[idx].songIds || []).map(String),
                ...formatted.songIds
              ]));
              merged[idx] = { ...merged[idx], ...formatted, songIds: combinedSongIds };
            } else {
              merged.push(formatted);
            }
          });
          return merged;
        });
      }
    } catch (e) {
      console.warn('Failed to fetch playlists:', e);
    }

    try {
      const likes = await likeService.getLikes();
      if (Array.isArray(likes) && likes.length > 0) {
        setLikedSongs(prev => Array.from(new Set([...prev, ...likes.map(String)])));
      }
    } catch (e) {
      console.warn('Failed to fetch likes:', e);
    }

    try {
      const acts = await activityService.getActivities();
      if (Array.isArray(acts) && acts.length > 0) {
        setRecentActivity(prev => {
          const combined = [...acts];
          prev.forEach(p => {
            if (!combined.some(c => c.id === p.id || (c.message === p.message && c.timestamp === p.timestamp))) {
              combined.push(p);
            }
          });
          return combined.slice(0, 20);
        });
      }
    } catch (e) {
      console.warn('Failed to fetch activities:', e);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUserData();
    }
  }, [isAuthenticated, refreshUserData]);

  const setAuthUser = useCallback((user) => {
    if (!user) return;
    setIsAuthenticated(true);
    setUserProfile(prev => {
      const updated = {
        ...prev,
        id: user.id || prev.id,
        username: user.username ? (user.username.startsWith('@') ? user.username : `@${user.username}`) : prev.username,
        email: user.email || prev.email,
        name: user.name || user.username || prev.name,
        bio: user.bio || prev.bio,
        avatarUrl: user.avatarUrl || user.avatar_url || prev.avatarUrl
      };
      try {
        localStorage.setItem('userProfile', JSON.stringify(updated));
        localStorage.setItem('app_userProfile', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage profile save error:', e);
      }
      return updated;
    });
  }, []);

  const updateProfile = useCallback((data) => {
    setAuthUser(data);
    authService.updateProfile(data).catch(err => {
      console.warn('Failed to update profile in DB:', err);
    });
  }, [setAuthUser]);

  const logout = useCallback(() => {
    setToken(null);
    setIsAuthenticated(false);
    setUserProfile(INITIAL_PROFILE);
    setPlaylists([]);
    setLikedSongs([]);
    setRecentActivity([]);
    setActiveNav('Home');
    try {
      localStorage.removeItem('userProfile');
      localStorage.removeItem('app_userProfile');
      localStorage.removeItem('playlists');
      localStorage.removeItem('app_playlists');
      localStorage.removeItem('likedSongs');
      localStorage.removeItem('app_likedSongs');
      localStorage.removeItem('recentActivity');
      localStorage.removeItem('app_recentActivity');
      localStorage.removeItem('app_auth_token');
    } catch (e) {
      console.warn('LocalStorage logout clear error:', e);
    }
  }, []);

  const addActivity = useCallback((message, image = null) => {
    const newActivity = { id: `act-${Date.now()}`, message, image, timestamp: Date.now() };
    setRecentActivity(prev => [newActivity, ...prev].slice(0, 20));

    activityService.addActivity(message, image).catch(err => {
      console.warn('Failed to persist activity to DB:', err);
    });
  }, []);

  const toggleLike = useCallback(async (song) => {
    if (!song) return;
    const songId = String(song.id);
    const isLiked = likedSongs.includes(songId);

    // Immediate reactive UI update
    setLikedSongs(prev => isLiked ? prev.filter(id => id !== songId) : [...prev, songId]);
    if (!isLiked) addActivity(`Liked ${song.title}`, song.artwork);

    try {
      if (isLiked) {
        await likeService.unlikeSong(songId);
      } else {
        await likeService.likeSong(songId);
      }
    } catch (err) {
      // Backend sync optional
    }
  }, [likedSongs, addActivity]);

  const createPlaylist = useCallback(async (name, description = '') => {
    const newId = `pl-${Date.now()}`;
    const newPlaylist = {
      id: newId,
      name,
      description: description || '',
      songIds: []
    };

    // Immediate reactive UI update
    setPlaylists(prev => [...prev, newPlaylist]);
    addActivity(`Created a new playlist: ${name}`);

    try {
      const backendPl = await playlistService.createPlaylist(name, description);
      if (backendPl && backendPl.id) {
        setPlaylists(prev => prev.map(pl => pl.id === newId ? { ...pl, id: String(backendPl.id) } : pl));
      }
    } catch (err) {
      // Backend sync optional
    }
  }, [addActivity]);

  const updatePlaylist = useCallback(async (id, name, description) => {
    const targetId = String(id);
    // Immediate reactive UI update
    setPlaylists(prev => prev.map(pl => String(pl.id) === targetId ? { ...pl, name, description } : pl));

    try {
      await playlistService.updatePlaylist(targetId, name, description);
    } catch (err) {
      // Backend sync optional
    }
  }, []);

  const deletePlaylist = useCallback(async (id) => {
    const targetId = String(id);
    // Immediate reactive UI update
    setPlaylists(prev => prev.filter(pl => String(pl.id) !== targetId));

    try {
      await playlistService.deletePlaylist(targetId);
    } catch (err) {
      // Backend sync optional
    }
  }, []);

  const addSongToPlaylist = useCallback(async (playlistId, song) => {
    if (!song) return;
    const songId = String(song.id);
    const targetPlId = String(playlistId);

    // Ensure song object is preserved in allSongs state
    setAllSongs(prev => {
      if (!prev.some(s => String(s.id) === songId)) {
        return [...prev, song];
      }
      return prev;
    });

    // Immediate reactive UI update
    setPlaylists(prev => {
      return prev.map(pl => {
        if (String(pl.id) === targetPlId) {
          const currentSongIds = pl.songIds ? pl.songIds.map(id => typeof id === 'object' ? String(id.id) : String(id)) : [];
          if (!currentSongIds.includes(songId)) {
            addActivity(`Added ${song.title} to ${pl.name}`, song.artwork);
            return { ...pl, songIds: [...currentSongIds, songId] };
          }
        }
        return pl;
      });
    });

    try {
      await playlistService.addSong(playlistId, songId);
    } catch (err) {
      // Backend sync optional
    }
  }, [addActivity]);

  const removeSongFromPlaylist = useCallback(async (playlistId, songId) => {
    const targetPlId = String(playlistId);
    const targetSongId = String(songId);

    // Immediate reactive UI update
    setPlaylists(prev => prev.map(pl => {
      if (String(pl.id) === targetPlId) {
        return {
          ...pl,
          songIds: (pl.songIds || []).map(id => typeof id === 'object' ? String(id.id) : String(id)).filter(id => id !== targetSongId)
        };
      }
      return pl;
    }));

    try {
      await playlistService.removeSong(playlistId, targetSongId);
    } catch (err) {
      // Backend sync optional
    }
  }, []);

  const playSong = useCallback((song, queue = null) => {
    if (!song) return;
    const formatted = formatSongObject(song);
    const audio = audioRef.current;
    console.log('[DIAGNOSTIC] playSong called:', {
      id: formatted.id,
      title: formatted.title,
      audioSrc: audio?.src,
      currentSrc: audio?.currentSrc,
      networkState: audio?.networkState,
      readyState: audio?.readyState
    });

    if (queue && Array.isArray(queue)) {
      setPlaylistQueue(queue.map(formatSongObject));
    }
    setCurrentSong(formatted);
    setIsPlaying(true);
    addActivity(`Played ${formatted.title}`, formatted.artwork);
  }, [addActivity]);

  const togglePlayPause = useCallback(() => {
    if (!currentSong && allSongs.length > 0) {
      playSong(allSongs[0]);
      return;
    }
    setIsPlaying((prev) => !prev);
  }, [currentSong, allSongs, playSong]);

  const playNext = useCallback(() => {
    if (!currentSong || playlistQueue.length === 0) return;
    const idx = playlistQueue.findIndex((s) => String(s.id) === String(currentSong.id));
    const nextIdx = idx === -1 ? 0 : (idx + 1) % playlistQueue.length;
    setCurrentSong(playlistQueue[nextIdx]);
    setIsPlaying(true);
  }, [currentSong, playlistQueue]);

  const playPrev = useCallback(() => {
    if (!currentSong || playlistQueue.length === 0) return;
    const idx = playlistQueue.findIndex((s) => String(s.id) === String(currentSong.id));
    const prevIdx = idx <= 0 ? playlistQueue.length - 1 : idx - 1;
    setCurrentSong(playlistQueue[prevIdx]);
    setIsPlaying(true);
  }, [currentSong, playlistQueue]);

  const addToLibrary = useCallback((song) => {
    setLibrary((prev) => {
      if (prev.some((s) => String(s.id) === String(song.id))) return prev;
      return [...prev, song];
    });
  }, []);

  const isInLibrary = useCallback(
    (songId) => library.some((s) => String(s.id) === String(songId)),
    [library],
  );

  const handleSeek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const handleVolumeChange = useCallback((val) => {
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  }, []);

  const playNextRef = useRef(playNext);
  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  // 1. Reset progress and set initial duration fallback when currentSong changes
  useEffect(() => {
    if (currentSong) {
      setProgress(0);
      if (currentSong.duration && isFinite(currentSong.duration) && Number(currentSong.duration) > 0) {
        setDuration(Number(currentSong.duration));
      } else {
        setDuration(0);
      }
    }
  }, [currentSong?.id]);

  // 2. Control audio element src, play and pause synchronization
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong) {
      const srcUrl = currentSong.audioUrl || `/api/songs/${currentSong.id}/stream`;
      const fullUrl = srcUrl.startsWith('http') ? srcUrl : `${window.location.origin}${srcUrl}`;

      if (audio.src !== fullUrl) {
        console.log('[AUDIO PLAYER] Setting audio src to:', fullUrl);
        audio.src = fullUrl;
        audio.load();
      }

      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('[AUDIO PLAYER] Playback started for:', currentSong.title);
            })
            .catch((err) => {
              console.error('[AUDIO PLAYER] Play error:', err.name, err.message);
              if (err.name !== 'AbortError' && err.name !== 'NotSupportedError') {
                setIsPlaying(false);
              }
            });
        }
      } else {
        if (!audio.paused) {
          audio.pause();
        }
      }
    }
  }, [currentSong?.id, isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // 3. Centralized Audio Event Listeners (timeupdate, loadedmetadata, durationchange, play, pause, ended)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.currentTime !== undefined && !isNaN(audio.currentTime)) {
        setProgress(audio.currentTime);
      }
    };

    const handleDuration = () => {
      const dur = audio.duration;
      if (dur && isFinite(dur) && !isNaN(dur) && dur > 0) {
        setDuration(dur);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (playNextRef.current) {
        playNextRef.current();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleDuration);
    audio.addEventListener('durationchange', handleDuration);
    audio.addEventListener('canplay', handleDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleDuration);
      audio.removeEventListener('durationchange', handleDuration);
      audio.removeEventListener('canplay', handleDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const filteredSongs = searchQuery.trim()
    ? allSongs.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.artist.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const navigateTo = useCallback((nav) => {
    setActiveNav(nav);
    setSidebarOpen(false);
  }, []);

  const value = {
    isAuthenticated,
    authLoading,
    activeNav,
    setActiveNav: navigateTo,
    searchQuery,
    setSearchQuery,
    allSongs,
    filteredSongs,
    profileOpen,
    setProfileOpen,
    notificationOpen,
    setNotificationOpen,
    sidebarOpen,
    setSidebarOpen,
    library,
    addToLibrary,
    isInLibrary,
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    playSong,
    togglePlayPause,
    playNext,
    playPrev,
    handleSeek,
    handleVolumeChange,
    showMoreMenu,
    setShowMoreMenu,
    audioRef,
    playlists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    userProfile,
    setAuthUser,
    updateProfile,
    logout,
    likedSongs,
    toggleLike,
    recentActivity,
    selectedArtist,
    setSelectedArtist,
    isPlayerExpanded,
    expandPlayer,
    minimizePlayer,
    togglePlayerExpanded,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
