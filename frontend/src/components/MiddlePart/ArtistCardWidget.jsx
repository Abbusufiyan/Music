import { useApp } from '../../context/AppContext'
import { ARTISTS } from '../../data/musicData'
import { User, ChevronRight } from 'lucide-react'
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

function findMatchingArtist(song) {
  if (!song || !song.artist) return null

  // 1. Match by artistId if available
  if (song.artistId) {
    const matched = ARTISTS.find((a) => String(a.id) === String(song.artistId))
    if (matched) return matched
  }

  const rawSongArtist = song.artist.trim()
  const nSongArtist = normalizeName(rawSongArtist)

  // 2. Exact or normalized name match
  for (const artist of ARTISTS) {
    const nArtistName = normalizeName(artist.name)
    if (nSongArtist === nArtistName) return artist
    if (rawSongArtist.toLowerCase() === artist.name.toLowerCase()) return artist
  }

  // 3. Substring match for multi-artist credits (e.g. "Arijit Singh / Pritam")
  for (const artist of ARTISTS) {
    const nArtistName = normalizeName(artist.name)
    if (
      nArtistName.length > 3 &&
      (nSongArtist.includes(nArtistName) || nArtistName.includes(nSongArtist))
    ) {
      return artist
    }
  }

  // 4. Fallback for artists not listed in static array
  return {
    id: `dynamic-${rawSongArtist}`,
    name: rawSongArtist,
    image:
      song.artwork ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    rating: 4.9,
    bio: 'Performing musical artist.',
  }
}

export default function ArtistCardWidget() {
  const { currentSong, setActiveNav, setSelectedArtist } = useApp()

  const artist = findMatchingArtist(currentSong)

  const handleClick = () => {
    if (!artist) return
    if (setSelectedArtist) {
      setSelectedArtist(artist)
    }
    setActiveNav('Artists')
  }

  if (!currentSong || !artist) {
    return (
      <div
        className="w-full max-w-xs shrink-0 p-4 rounded-3xl text-center select-none transition-all duration-300"
        style={{
          background: 'rgba(18, 19, 26, 0.75)',
          backdropFilter: 'blur(40px) saturate(160%)',
          WebkitBackdropFilter: 'blur(40px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
        }}
      >
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2 text-white/30">
          <User size={18} />
        </div>
        <h4 className="text-white/60 font-medium text-xs">No artist selected</h4>
        <p className="text-white/40 text-[11px] mt-0.5">Play a song to view artist</p>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="
        group
        relative
        w-full
        max-w-xs
        shrink-0
        p-4
        rounded-3xl
        cursor-pointer
        select-none
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:bg-white/[0.09]
        hover:border-white/20
        hover:shadow-2xl
        hover:shadow-black/40
        flex
        flex-col
        items-center
        text-center
      "
      style={{
        background: 'rgba(18, 19, 26, 0.75)',
        backdropFilter: 'blur(40px) saturate(160%)',
        WebkitBackdropFilter: 'blur(40px) saturate(160%)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
      }}
    >
      {/* Small Compact Circular Artist Portrait */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-lg border-2 border-white/20 mb-2.5 shrink-0 bg-black/40">
        <img
          src={resolveApiUrl(artist.image)}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'
          }}
        />
      </div>

      {/* Artist Name & Subtitle */}
      <div className="w-full px-2">
        <h4
          className="text-white font-bold text-sm truncate group-hover:text-emerald-400 transition-colors"
          title={artist.name}
        >
          {artist.name}
        </h4>
        <p className="text-white/50 text-[11px] font-medium flex items-center justify-center gap-1 mt-0.5">
          <span>Artist</span>
          <ChevronRight
            size={12}
            className="group-hover:translate-x-0.5 transition-transform text-white/50"
          />
        </p>
      </div>
    </div>
  )
}
