import { RECENTLY_PLAYED } from '../../data/musicData'
import { useApp } from '../../context/AppContext'
import { PlayButton } from '../ui/PlayButton'

export function RecentlyPlayed() {
  const { playSong, currentSong, isPlaying, togglePlayPause, allSongs } = useApp()

  // Use allSongs from context (including Google Drive songs) if present, falling back to static items
  const items = (allSongs && allSongs.length > 0)
    ? allSongs.slice(0, 8).map(song => ({
        id: song.id,
        title: song.title,
        category: song.artist || 'Google Drive',
        image: song.artwork,
        song,
      }))
    : RECENTLY_PLAYED

  const songsQueue = items.map(i => i.song)

  return (
    <section
      className="glass-panel p-5 rounded-3xl border border-white/10 shadow-xl flex-1 min-h-0 flex flex-col"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      }}
    >
      <h2 className="text-white font-semibold text-base mb-4 px-1 shrink-0">
        Recently Played
      </h2>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {items.map((item) => {
          const isCurrent = currentSong?.id === item.song.id
          const playing = isCurrent && isPlaying

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/8 transition-colors cursor-pointer group"
              onClick={() => playSong(item.song, songsQueue)}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {item.title}
                </p>
                <p className="text-white/50 text-xs truncate">{item.category}</p>
              </div>
              <PlayButton
                isPlaying={playing}
                onClick={(e) => {
                  e.stopPropagation()
                  isCurrent
                    ? togglePlayPause()
                    : playSong(item.song, songsQueue)
                }}
                size="sm"
                className="opacity-80 group-hover:opacity-100"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
