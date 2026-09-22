import { useState, useRef, useEffect } from 'react'
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  SlidersHorizontal,
  Heart,
  Plus,
  Maximize2,
} from 'lucide-react'
import { formatTime } from '../../data/musicData'
import { resolveApiUrl } from '../../api/apiClient'
import { useApp } from '../../context/AppContext'

// 1. MINIMIZED PLAYER CARD (Fits cleanly inside the Left Sidebar below Recently Played)
export function MinimizedPlayerCard() {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrev,
    progress,
    duration,
    handleSeek,
    volume,
    handleVolumeChange,
    likedSongs,
    toggleLike,
    playlists,
    addSongToPlaylist,
    expandPlayer,
  } = useApp()

  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowPlaylistMenu(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  if (!currentSong) return null

  const isLiked = likedSongs.includes(String(currentSong.id))
  const progressPercent = duration && isFinite(duration) && duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0

  return (
    <div
      onClick={expandPlayer}
      className="glass-panel rounded-3xl p-3.5 border border-white/10 shadow-xl flex flex-col gap-2.5 w-full select-none cursor-pointer hover:bg-white/[0.08] transition-all duration-300 group"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      }}
      title="Click to expand player to center"
    >
      {/* Top Info Row: Artwork + Track Title & Artist + Favorite & Add to Playlist */}
      <div className="flex items-center gap-2.5 min-w-0">
        <img
          src={resolveApiUrl(currentSong.artwork)}
          alt={currentSong.title}
          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-white/10 shadow-sm"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
          }}
        />

        <div className="flex-1 min-w-0 pr-1">
          <h4
            className="text-white font-semibold text-xs truncate group-hover:text-emerald-300 transition-colors"
            title={currentSong.title}
          >
            {currentSong.title}
          </h4>
          <p
            className="text-white/50 text-[11px] font-normal truncate mt-0.5"
            title={currentSong.artist}
          >
            {currentSong.artist}
          </p>
        </div>

        {/* Favorite & Playlist Quick Buttons */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => toggleLike(currentSong)}
            className={`p-1 transition-colors ${
              isLiked ? 'text-rose-400' : 'text-white/40 hover:text-white'
            }`}
            title={isLiked ? 'Liked' : 'Favorite'}
          >
            <Heart size={14} className={isLiked ? 'fill-rose-400' : ''} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
              className="p-1 text-white/40 hover:text-white transition-colors"
              title="Add to Playlist"
            >
              <Plus size={14} />
            </button>

            {showPlaylistMenu && (
              <div className="absolute bottom-full right-0 mb-2 glass-dropdown rounded-xl p-2 min-w-[140px] shadow-2xl z-50">
                <p className="px-2 py-1 text-[10px] font-semibold text-white/50 uppercase border-b border-white/10 mb-1">
                  Add to Playlist
                </p>
                <div className="max-h-28 overflow-y-auto custom-scrollbar space-y-1">
                  {playlists.length === 0 ? (
                    <p className="px-2 py-1 text-[10px] text-white/40 text-center">No playlists</p>
                  ) : (
                    playlists.map((pl) => (
                      <button
                        key={pl.id}
                        type="button"
                        onClick={() => {
                          addSongToPlaylist(pl.id, currentSong)
                          setShowPlaylistMenu(false)
                        }}
                        className="w-full text-left px-2 py-1 text-[11px] text-white/80 hover:bg-white/10 rounded-lg truncate block"
                      >
                        {pl.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrubber Progress Bar & Timestamps */}
      <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
        <div
          className="h-1 w-full bg-white/15 hover:bg-white/25 rounded-full cursor-pointer relative overflow-hidden transition-colors"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            handleSeek(pct * (duration || 0))
          }}
        >
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] text-white/40 font-mono">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Bottom Controls Row: Prev, Play/Pause, Next, Volume & Expand */}
      <div className="flex items-center justify-between pt-0.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={playPrev}
            className="text-white/70 hover:text-white transition-colors cursor-pointer p-0.5"
            title="Previous"
          >
            <SkipBack size={14} fill="currentColor" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={12} fill="currentColor" />
            ) : (
              <Play size={12} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            className="text-white/70 hover:text-white transition-colors cursor-pointer p-0.5"
            title="Next"
          >
            <SkipForward size={14} fill="currentColor" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.7)}
            className="text-white/60 hover:text-white transition-colors p-0.5 cursor-pointer"
            title={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          <button
            type="button"
            onClick={expandPlayer}
            className="text-white/40 hover:text-white transition-colors p-0.5 cursor-pointer ml-1"
            title="Restore to Center"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// 2. MAIN FLOATING MUSIC PLAYER (Renders Original Expanded Capsule when expanded)
export function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrev,
    progress,
    duration,
    volume,
    handleSeek,
    handleVolumeChange,
    likedSongs,
    toggleLike,
    activeNav,
    isPlayerExpanded,
  } = useApp()

  if (!currentSong) return null
  if (activeNav === 'Songs') return null
  if (!isPlayerExpanded) return null

  const isLiked = likedSongs.includes(String(currentSong.id))
  const progressPercent = duration && isFinite(duration) && duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center px-4 w-full max-w-2xl pointer-events-none select-none animate-in fade-in zoom-in-95 duration-300">
      <div
        className="glass-panel rounded-full px-6 py-3 flex items-center gap-5 md:gap-6 shadow-2xl pointer-events-auto w-full border border-white/10 transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(32px) saturate(140%)',
          WebkitBackdropFilter: 'blur(32px) saturate(140%)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Controls */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <button
            type="button"
            onClick={playPrev}
            className="text-white/70 hover:text-white transition-colors cursor-pointer p-1"
            title="Previous"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={togglePlayPause}
            className="text-white hover:scale-110 transition-transform cursor-pointer p-1"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            onClick={playNext}
            className="text-white/70 hover:text-white transition-colors cursor-pointer p-1"
            title="Next"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {/* Center Inner Pill with Glass Styling */}
        <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 px-3.5 flex-1 min-w-0 overflow-hidden shadow-inner group">
          <img
            src={resolveApiUrl(currentSong.artwork)}
            alt={currentSong.title}
            className="w-9 h-9 rounded-xl object-cover shrink-0 border border-white/10"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
            }}
          />
          <div className="flex-1 min-w-0 pr-2">
            <h4
              className="text-white font-semibold text-xs truncate leading-snug"
              title={currentSong.title}
            >
              {currentSong.title}
            </h4>
            <p
              className="text-white/50 text-[11px] font-normal truncate"
              title={currentSong.artist}
            >
              {currentSong.artist}
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleLike(currentSong)}
            className={`transition-colors p-1 cursor-pointer shrink-0 ${
              isLiked ? 'text-rose-400' : 'text-white/40 hover:text-white'
            }`}
            title={isLiked ? 'Liked' : 'Favorite'}
          >
            <Heart size={16} className={isLiked ? 'fill-rose-400' : ''} />
          </button>

          {/* Bottom Progress Scrubber Line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              handleSeek(pct * (duration || 0))
            }}
          >
            <div
              className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="hidden sm:flex items-center gap-4 text-white/70 shrink-0">
          <button
            type="button"
            className="hover:text-white transition-colors p-1 cursor-pointer"
            title="Stream / Cast"
          >
            <Radio size={18} />
          </button>
          <button
            type="button"
            className="hover:text-white transition-colors p-1 cursor-pointer"
            title="Audio Equalizer"
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <button
              type="button"
              onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.7)}
              className="hover:text-white transition-colors cursor-pointer p-1"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-14 accent-white h-1 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
