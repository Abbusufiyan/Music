import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Plus, Edit2, Trash2, X, Play, Music, Heart, Disc } from 'lucide-react'
import { ALL_SONGS as FALLBACK_SONGS } from '../../data/musicData'
import { resolveApiUrl } from '../../api/apiClient'

export default function PlaylistsContent() {
  const {
    playlists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    removeSongFromPlaylist,
    allSongs,
    playSong,
    likedSongs,
    toggleLike,
    currentSong,
    isPlaying,
    togglePlayPause,
  } = useApp()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editPlaylist, setEditPlaylist] = useState(null)
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')

  const handleOpenCreate = () => {
    setNameInput('')
    setDescInput('')
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (pl) => {
    setNameInput(pl.name)
    setDescInput(pl.description || '')
    setEditPlaylist(pl)
  }

  const handleSave = () => {
    if (!nameInput.trim()) return

    if (editPlaylist) {
      updatePlaylist(editPlaylist.id, nameInput, descInput)
    } else {
      createPlaylist(nameInput, descInput)
    }

    setIsCreateOpen(false)
    setEditPlaylist(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(id)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="pb-16 relative">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Playlists</h1>
          <p className="text-white/60 text-sm">Curated collections for every mood.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md transition-colors border border-white/20 text-sm font-semibold cursor-pointer"
        >
          <Plus size={18} />
          Create Playlist
        </button>
      </div>

      {/* Main Playlists List */}
      <div className="space-y-12">
        {playlists.length === 0 ? (
          <div className="glass-panel text-center py-16 px-6 rounded-3xl border border-white/10 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Plus size={28} className="text-white/40" />
            </div>
            <h2 className="text-xl text-white font-bold mb-2">No playlists yet</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              Create your first playlist and start organizing your favorite tracks.
            </p>
            <button
              onClick={handleOpenCreate}
              className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform cursor-pointer"
            >
              Create Now
            </button>
          </div>
        ) : (
          playlists.map((pl) => {
            const plSongs = (pl.songIds || [])
              .map((id) => {
                if (typeof id === 'object' && id !== null) return id
                return (
                  allSongs.find((s) => String(s.id) === String(id)) ||
                  FALLBACK_SONGS.find((s) => String(s.id) === String(id))
                )
              })
              .filter(Boolean)

            const coverImage =
              plSongs[0]?.artwork ||
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'

            return (
              <div
                key={pl.id}
                className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl space-y-8"
              >
                {/* Playlist Header: Cover Artwork + Metadata */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Fixed Size Cover Artwork (220px x 220px) */}
                  <div className="relative w-48 h-48 sm:w-[220px] sm:h-[220px] aspect-square rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/15 bg-black/40 group">
                    <img
                      src={resolveApiUrl(coverImage)}
                      alt={pl.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'
                      }}
                    />
                    {plSongs.length > 0 && (
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <button
                          onClick={() => playSong(plSongs[0], plSongs)}
                          className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Play size={24} fill="currentColor" className="ml-1" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Playlist Info */}
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        {pl.name}
                      </h2>
                      <span className="text-xs font-semibold text-white/70 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                        {plSongs.length} {plSongs.length === 1 ? 'Song' : 'Songs'}
                      </span>
                    </div>

                    <p className="text-white/60 text-sm leading-relaxed max-w-xl">
                      {pl.description || 'Personal music playlist.'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                      {plSongs.length > 0 && (
                        <button
                          onClick={() => playSong(plSongs[0], plSongs)}
                          className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg cursor-pointer"
                        >
                          <Play size={16} fill="currentColor" />
                          Play All
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(pl)}
                        className="flex items-center gap-2 glass-btn px-4 py-2.5 rounded-full text-white/80 hover:text-white text-sm font-medium border border-white/10 cursor-pointer"
                      >
                        <Edit2 size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(pl.id)}
                        className="flex items-center gap-2 glass-btn px-4 py-2.5 rounded-full text-rose-300 hover:text-rose-200 text-sm font-medium border border-rose-500/20 hover:border-rose-500/40 cursor-pointer"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Playlist Songs Section */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                    <Music size={18} className="text-indigo-400" />
                    Songs ({plSongs.length})
                  </h3>

                  {plSongs.length > 0 ? (
                    <div className="space-y-2">
                      {plSongs.map((song, idx) => {
                        const isCurrent = currentSong?.id === song.id
                        const songPlaying = isCurrent && isPlaying
                        const isLiked = likedSongs.includes(song.id)

                        return (
                          <div
                            key={`${song.id}-${idx}`}
                            className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 group border ${
                              isCurrent
                                ? 'bg-white/15 border-white/20'
                                : 'bg-white/5 hover:bg-white/10 border-white/5'
                            }`}
                          >
                            {/* Track Info */}
                            <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                              <span className="text-white/40 text-xs font-mono w-5 text-right shrink-0">
                                {idx + 1}
                              </span>

                              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/40">
                                <img
                                  src={resolveApiUrl(song.artwork)}
                                  alt={song.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    isCurrent
                                      ? togglePlayPause()
                                      : playSong(song, plSongs)
                                  }
                                  className={`absolute inset-0 bg-black/40 text-white flex items-center justify-center transition-opacity ${
                                    songPlaying
                                      ? 'opacity-100'
                                      : 'opacity-0 group-hover:opacity-100'
                                  }`}
                                >
                                  {songPlaying ? (
                                    <Disc size={18} className="animate-spin text-emerald-400" />
                                  ) : (
                                    <Play size={18} fill="currentColor" />
                                  )}
                                </button>
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4
                                  className={`font-semibold text-sm truncate ${
                                    isCurrent ? 'text-emerald-400' : 'text-white'
                                  }`}
                                >
                                  {song.title}
                                </h4>
                                <p className="text-white/50 text-xs truncate mt-0.5">
                                  {song.artist}
                                </p>
                              </div>
                            </div>

                            {/* Actions & Duration */}
                            <div className="flex items-center gap-4 shrink-0">
                              <button
                                onClick={() => toggleLike(song)}
                                className={`transition-colors p-1 ${
                                  isLiked
                                    ? 'text-rose-400'
                                    : 'text-white/30 hover:text-white'
                                }`}
                              >
                                <Heart
                                  size={16}
                                  className={isLiked ? 'fill-rose-400' : ''}
                                />
                              </button>

                              <span className="text-white/40 text-xs font-mono tabular-nums">
                                {formatDuration(song.duration)}
                              </span>

                              <button
                                onClick={() =>
                                  removeSongFromPlaylist(pl.id, song.id)
                                }
                                className="text-white/30 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                                title="Remove from playlist"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                      <p className="text-white/40 text-sm">
                        This playlist is empty. Add songs from the library!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal for Create/Edit Playlist */}
      {(isCreateOpen || editPlaylist) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/20 shadow-2xl relative">
            <button
              onClick={() => {
                setIsCreateOpen(false)
                setEditPlaylist(null)
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editPlaylist ? 'Edit Playlist' : 'New Playlist'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="My Awesome Playlist"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Description{' '}
                  <span className="text-white/30 text-xs">(optional)</span>
                </label>
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/40 transition-colors resize-none h-24"
                  placeholder="What's the vibe?"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditPlaylist(null)
                }}
                className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!nameInput.trim()}
                className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}