import { ArrowRight } from 'lucide-react'
import { NEW_RELEASES } from '../../data/musicData'
import { useApp } from '../../context/AppContext'
import { PlayButton } from '../ui/PlayButton'

export function NewReleases() {
  const { playSong, currentSong, isPlaying, togglePlayPause, allSongs } = useApp()

  // 1. Filter real Arijit Singh songs from DB allSongs array
  const dbArijitSongs = (allSongs || []).filter(
    (s) => s && s.artist && s.artist.toLowerCase().includes('arijit')
  )

  // 2. Build list of 3 items (from DB or NEW_RELEASES fallback)
  const items = dbArijitSongs.length >= 3
    ? dbArijitSongs.slice(0, 3).map((song) => ({
        id: `nr-${song.id}`,
        title: song.title,
        subtitle: song.artist || 'Arijit Singh',
        image: `/api/images/song/${song.id}`,
        song: song,
      }))
    : NEW_RELEASES

  return (
    <section
      className="glass-panel p-5 rounded-3xl border border-white/10 shadow-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      }}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-white font-semibold text-base flex items-center gap-2">
          <span>🔥</span> New Releases
        </h2>
        <button
          type="button"
          className="text-white/50 text-xs hover:text-white transition-colors flex items-center gap-1"
        >
          Browse All <ArrowRight size={12} />
        </button>
      </div>

      <div className="space-y-3">
        {items.map((release) => {
          const isCurrent = currentSong?.id === release.song.id
          const playing = isCurrent && isPlaying

          return (
            <div
              key={release.id}
              className="relative rounded-2xl overflow-hidden group cursor-pointer h-36"
              onClick={() => playSong(release.song, items.map((r) => r.song))}
            >
              <img
                src={release.image}
                alt={release.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="relative h-full flex items-end justify-between px-4 pb-4">
                <div>
                  <p className="text-white font-semibold text-sm line-clamp-1">{release.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{release.subtitle}</p>
                </div>
                <PlayButton
                  isPlaying={playing}
                  onClick={() =>
                    isCurrent ? togglePlayPause() : playSong(release.song, items.map((r) => r.song))
                  }
                  size="sm"
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
