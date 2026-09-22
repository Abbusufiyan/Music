import { useMemo, useState } from 'react'
import { ARTISTS, ALL_SONGS, ALBUMS } from '../../data/musicData'
import { useApp } from '../../context/AppContext'
import ArtistCard from './ArtistCard'
import SongCard from './SongCard'
import { ArrowLeft, Star, Play, UserPlus, Check } from 'lucide-react'
import { resolveApiUrl } from '../../api/apiClient'

function normalizeName(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/\bustad\b/g, '')
    .replace(/\bmohamad\b/g, 'mohammed')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchSongToArtist(song, artist) {
  if (!song || !artist) return false

  if (song.artistId && String(song.artistId) === String(artist.id)) {
    return true
  }

  const songArtist = (song.artist || '').trim()
  const artistName = (artist.name || '').trim()

  if (!songArtist || !artistName) return false

  const sLower = songArtist.toLowerCase()
  const aLower = artistName.toLowerCase()

  if (sLower === aLower) return true

  const nSongArtist = normalizeName(songArtist)
  const nArtistName = normalizeName(artistName)

  if (nSongArtist === nArtistName) return true

  const artistsInSong = nSongArtist.split(/\s*[\/&,]\s*/)
  if (
    artistsInSong.some(
      (a) => a === nArtistName || a.includes(nArtistName) || nArtistName.includes(a)
    )
  ) {
    return true
  }

  if (
    nArtistName.length > 3 &&
    (nSongArtist.includes(nArtistName) || nArtistName.includes(nSongArtist))
  ) {
    return true
  }

  return false
}

export default function ArtistsContent() {
  const { allSongs, selectedArtist, setSelectedArtist, playSong } = useApp()
  const [isFollowing, setIsFollowing] = useState(false)

  const songsSource = allSongs && allSongs.length > 0 ? allSongs : ALL_SONGS

  const artistAlbums = useMemo(() => {
    if (!selectedArtist) return []
    return ALBUMS.filter((al) => String(al.artistId) === String(selectedArtist.id))
  }, [selectedArtist])

  const artistSongs = useMemo(() => {
    if (!selectedArtist) return []
    return songsSource.filter((s) => matchSongToArtist(s, selectedArtist))
  }, [selectedArtist, songsSource])

  if (selectedArtist) {
    return (
      <div
        className="glass-panel p-6 lg:p-8 rounded-3xl border border-white/10 shadow-2xl pb-16"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => setSelectedArtist(null)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Artists
        </button>

        {/* Compact Artist Header (Fixed 200px artwork size) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div
            className="absolute inset-0 blur-3xl opacity-25 scale-125 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${resolveApiUrl(selectedArtist.image)})` }}
          />

          {/* Compact Artist Image (200px x 200px) */}
          <img
            src={resolveApiUrl(selectedArtist.image)}
            alt={selectedArtist.name}
            className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 aspect-square rounded-2xl object-cover shadow-2xl border border-white/20 shrink-0"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'
            }}
          />

          {/* Artist Details & Actions */}
          <div className="relative z-10 flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {selectedArtist.name}
              </h1>
              <div className="flex items-center gap-1 text-amber-400 bg-white/10 px-2.5 py-1 rounded-full text-xs font-semibold border border-white/10">
                <Star size={13} className="fill-amber-400" />
                <span>
                  {selectedArtist.rating ? selectedArtist.rating.toFixed(1) : '4.9'}
                </span>
              </div>
            </div>

            {selectedArtist.bio && (
              <p className="text-white/70 text-sm max-w-xl leading-relaxed line-clamp-3">
                {selectedArtist.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              {artistSongs.length > 0 && (
                <button
                  onClick={() => playSong(artistSongs[0], artistSongs)}
                  className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                  <Play size={16} fill="currentColor" />
                  Play Songs
                </button>
              )}

              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border cursor-pointer ${
                  isFollowing
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'glass-btn text-white/80 border-white/10 hover:text-white hover:bg-white/15'
                }`}
              >
                {isFollowing ? <Check size={16} /> : <UserPlus size={16} />}
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Albums by Artist Section (if any) */}
        {artistAlbums.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 px-1">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {artistAlbums.map((album) => (
                <div
                  key={album.id}
                  className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <img
                    src={resolveApiUrl(album.cover)}
                    alt={album.title}
                    className="w-full aspect-square object-cover rounded-xl mb-3 shadow-md"
                  />
                  <h3 className="text-white font-medium truncate text-sm">
                    {album.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Songs by Artist (Responsive Grid using SongCard) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white px-1">
            Songs by {selectedArtist.name} ({artistSongs.length})
          </h2>

          {artistSongs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
              {artistSongs.map((song) => (
                <SongCard key={`artist-song-${song.id}`} song={song} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center border border-white/10 my-6 max-w-md">
              <p className="text-white/60 text-base">
                No songs available for this artist.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="glass-panel p-6 lg:p-8 rounded-3xl border border-white/10 shadow-2xl pb-16"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Artists</h1>
        <p className="text-white/60 text-sm">Discover and follow your favorite artists.</p>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6 px-1">Popular Artists</h2>

        {/* 5-Column Grid on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
          {ARTISTS.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={setSelectedArtist}
            />
          ))}
        </div>
      </div>
    </div>
  )
}