import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { NEW_RELEASES } from '../../data/musicData'
import { useApp, findMatchingSong } from '../../context/AppContext'
import { PlayButton } from '../ui/PlayButton'
import { resolveApiUrl } from '../../api/apiClient'

export function NewReleases() {
  const { playSong, currentSong, isPlaying, togglePlayPause, allSongs } = useApp()

  const items = useMemo(() => {
    return NEW_RELEASES.map((release) => {
      const dbMatch = findMatchingSong(release.song, allSongs);
      const songToUse = dbMatch || release.song;
      return {
        ...release,
        id: `nr-${songToUse.id}`,
        title: songToUse.title,
        subtitle: songToUse.artist || release.subtitle,
        image: resolveApiUrl(songToUse.artwork || `/api/images/song/${songToUse.id}`),
        song: songToUse,
      };
    });
  }, [allSongs]);

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
