import { useApp } from '../../context/AppContext'
import SongCard from './SongCard'
import { Sparkles, Music2 } from 'lucide-react'

export default function SongsContent() {
  const { allSongs } = useApp()

  // New Releases / Featured tracks (e.g. top 6 songs or Google Drive uploaded tracks)
  const newReleases = allSongs.length >= 6 ? allSongs.slice(0, 6) : allSongs

  return (
    <div
      className="glass-panel p-6 lg:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-10 pb-28"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      }}
    >
      {/* Songs Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Songs</h1>
        <p className="text-white/60 text-sm">
          Discover tracks from your music library ({allSongs.length} total songs).
        </p>
      </div>

      {/* 1. New Releases Section (Horizontal Carousel) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-amber-400" />
            New Releases
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar pt-1 px-1">
          {newReleases.map((song) => (
            <div key={`nr-${song.id}`} className="w-[180px] sm:w-[195px] shrink-0">
              <SongCard song={song} />
            </div>
          ))}
        </div>
      </section>

      {/* 2. All Songs Section (Responsive Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Music2 size={20} className="text-indigo-400" />
            All Songs
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5 pb-10">
          {allSongs.map((song) => (
            <SongCard key={`all-${song.id}`} song={song} />
          ))}
        </div>
      </section>
    </div>
  )
}

