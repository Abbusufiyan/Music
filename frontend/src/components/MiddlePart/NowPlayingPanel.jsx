import { useApp } from '../../context/AppContext'
import { resolveApiUrl } from '../../api/apiClient'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Plus,
  Volume1,
  Volume2,
  Radio,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function NowPlayingPanel() {
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
    playlists,
    addSongToPlaylist,
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

  const isLiked = currentSong ? likedSongs.includes(String(currentSong.id)) : false

  const formatTimeStr = (seconds) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercent = duration && isFinite(duration) && duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0

  return (
    <aside
      className="w-full max-w-xs shrink-0 flex flex-col p-5 rounded-[32px] my-auto shadow-2xl select-none transition-all duration-300 z-20"
      style={{
        background: 'rgba(18, 19, 26, 0.75)',
        backdropFilter: 'blur(40px) saturate(160%)',
        WebkitBackdropFilter: 'blur(40px) saturate(160%)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
      }}
    >
      {currentSong ? (
        <div className="flex flex-col flex-1 justify-between gap-5 h-full">
          {/* 1. Large Square Album Artwork */}
          <div className="relative w-full aspect-square rounded-[24px] overflow-hidden shadow-2xl bg-black/40 group shrink-0">
            {/* Ambient Artwork Background Glow */}
            <div
              className="absolute inset-0 blur-2xl opacity-35 scale-125 bg-cover bg-center pointer-events-none transition-all duration-700"
              style={{ backgroundImage: `url(${resolveApiUrl(currentSong.artwork)})` }}
            />
            <img
              src={resolveApiUrl(currentSong.artwork)}
              alt={currentSong.title}
              className="relative z-10 w-full h-full object-cover rounded-[24px]"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
              }}
            />
          </div>

          {/* 2. Track Title & Artist Info */}
          <div className="space-y-1 px-1">
            <p className="text-white/40 text-xs font-medium tracking-wide">
              StreamWave
            </p>
            <h3
              className="text-white font-bold text-lg leading-snug line-clamp-1"
              title={currentSong.title}
            >
              {currentSong.title}
            </h3>
            <p
              className="text-white/60 text-sm font-normal line-clamp-1"
              title={currentSong.artist}
            >
              {currentSong.artist}
            </p>
          </div>

          {/* 3. Progress Scrubber Bar & Timestamps */}
          <div className="space-y-1.5 px-1">
            <div
              className="h-1.5 w-full bg-white/20 hover:bg-white/30 rounded-full cursor-pointer relative overflow-hidden transition-colors"
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
            <div className="flex justify-between items-center text-xs text-white/50 font-mono">
              <span>{formatTimeStr(progress)}</span>
              <span>{formatTimeStr(duration)}</span>
            </div>
          </div>

          {/* 4. Controls Row (iOS Media Widget Style) */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={playPrev}
              className="text-white/70 hover:text-white transition-colors cursor-pointer p-1.5"
              title="Previous Track"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>

            <button
              onClick={togglePlayPause}
              className="text-white hover:scale-105 transition-transform cursor-pointer p-1.5"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={34} fill="currentColor" />
              ) : (
                <Play size={34} fill="currentColor" />
              )}
            </button>

            <button
              onClick={playNext}
              className="text-white/70 hover:text-white transition-colors cursor-pointer p-1.5"
              title="Next Track"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>

            <button
              onClick={() => toggleLike(currentSong)}
              className={`transition-colors cursor-pointer p-1.5 ${
                isLiked ? 'text-rose-400' : 'text-white/50 hover:text-white'
              }`}
              title={isLiked ? 'Liked' : 'Favorite'}
            >
              <Heart size={20} className={isLiked ? 'fill-rose-400' : ''} />
            </button>
          </div>

          {/* 5. Volume Slider Bar */}
          <div className="flex items-center gap-3 px-1">
            <Volume1 size={16} className="text-white/40 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-white cursor-pointer h-1.5"
            />
            <Volume2 size={16} className="text-white/40 shrink-0" />
          </div>

          {/* 6. Playlist Action Button */}
          <div className="relative pt-1" ref={menuRef}>
            <button
              onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/8 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Add to Playlist</span>
            </button>

            {/* Playlist Dropdown Menu */}
            {showPlaylistMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 glass-dropdown border-none rounded-2xl shadow-2xl p-2 z-50">
                <p className="px-3 py-1.5 text-[10px] font-semibold text-white/50 uppercase border-b border-white/10 mb-1">
                  Add to Playlist
                </p>
                <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1">
                  {playlists.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-white/40 text-center">
                      No playlists available
                    </p>
                  ) : (
                    playlists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          addSongToPlaylist(pl.id, currentSong)
                          setShowPlaylistMenu(false)
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2 truncate cursor-pointer"
                      >
                        <Plus size={14} />
                        <span className="truncate">{pl.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center flex-1 text-center py-12 px-4 space-y-4">
          <div className="w-20 h-20 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-white/30 shadow-inner">
            <Radio size={36} />
          </div>
          <div className="space-y-1.5">
            <p className="text-white/40 text-[11px] font-medium uppercase tracking-wider">
              StreamWave
            </p>
            <h3 className="text-white font-bold text-base">No Track Playing</h3>
            <p className="text-white/40 text-xs max-w-[210px] leading-relaxed">
              Select any song from your library to display widget controls here.
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
