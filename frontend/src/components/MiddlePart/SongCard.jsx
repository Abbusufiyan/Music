import { Play, Pause, MoreVertical, Plus, Heart, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useState, useRef, useEffect } from 'react'
import { resolveApiUrl } from '../../api/apiClient'

export default function SongCard({ song, onRemove }) {
  const {
    playSong,
    playlists,
    addSongToPlaylist,
    likedSongs,
    toggleLike,
    currentSong,
    isPlaying,
    togglePlayPause,
  } = useApp()

  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!song) return null

  const isLiked = likedSongs.includes(song.id)
  const isCurrent = currentSong?.id === song.id
  const songPlaying = isCurrent && isPlaying

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlay = (e) => {
    e.stopPropagation()
    if (isCurrent) {
      togglePlayPause()
    } else {
      playSong(song)
    }
  }

  const handleLike = (e) => {
    e.stopPropagation()
    toggleLike(song)
  }

  return (
    <div
      onClick={handlePlay}
      className="
        group
        relative
        flex
        flex-col
        h-full
        w-full
        p-3.5
        rounded-2xl
        cursor-pointer
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:bg-white/[0.09]
        hover:border-white/20
        hover:shadow-2xl
        hover:shadow-black/40
      "
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Cover Image Container */}
      <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-xl bg-white/5 shrink-0">
        <img
          src={resolveApiUrl(song.artwork)}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            console.warn('[IMAGE LOG] Song image failed to load:', {
              id: song.id,
              title: song.title,
              artist: song.artist,
              imageUrl: resolveApiUrl(song.artwork),
            })
            const initials = (song.title || 'Track')
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
            e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" rx="24" fill="%23312e81"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="64" font-weight="bold">${initials}</text></svg>`
          }}
        />

        {/* Play / Pause Overlay */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] ${
            songPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            onClick={handlePlay}
            className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-lg hover:bg-white/40 transition-transform transform hover:scale-105 cursor-pointer"
            title={songPlaying ? 'Pause' : 'Play'}
          >
            {songPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>
        </div>

        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(song.id)
            }}
            className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all z-10"
            title="Remove from playlist"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Song Details Container */}
      <div className="flex flex-col flex-1 justify-between gap-1.5 min-w-0">
        <div>
          <h3
            className="text-white font-semibold text-sm line-clamp-1 group-hover:text-white transition-colors"
            title={song.title}
          >
            {song.title}
          </h3>
          <p
            className="text-white/60 text-xs line-clamp-1 mt-0.5"
            title={song.artist}
          >
            {song.artist}
          </p>
        </div>

        {/* Bottom Bar: Heart, Duration, Options */}
        <div className="flex items-center justify-between text-xs pt-1 mt-auto">
          <button
            onClick={handleLike}
            className={`transition-colors p-1 -ml-1 ${
              isLiked ? 'text-rose-400' : 'text-white/40 hover:text-white'
            }`}
            title={isLiked ? 'Unlike' : 'Favorite'}
          >
            <Heart size={15} className={isLiked ? 'fill-rose-400' : ''} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-white/40 text-[11px] tabular-nums font-mono">
              {formatDuration(song.duration)}
            </span>

            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title="More Options"
              >
                <MoreVertical size={14} />
              </button>

              {showMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-44 glass-dropdown border-none rounded-xl shadow-2xl py-1 z-[99999] overflow-hidden">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-white/50 uppercase tracking-wider border-b border-white/10">
                    Add to Playlist
                  </div>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar">
                    {playlists.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-white/40 text-center">
                        No playlists yet
                      </div>
                    ) : (
                      playlists.map((pl) => (
                        <button
                          key={pl.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            addSongToPlaylist(pl.id, song)
                            setShowMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 truncate cursor-pointer"
                        >
                          <Plus size={13} />
                          <span className="truncate">{pl.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
