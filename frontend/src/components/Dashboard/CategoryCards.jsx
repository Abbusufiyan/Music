import { CATEGORY_CARDS, ALL_SONGS } from '../../data/musicData'
import { useApp } from '../../context/AppContext'
import { PlayButton } from '../ui/PlayButton'
import { resolveApiUrl } from '../../api/apiClient'

export function CategoryCards() {
  const {
    setActiveNav,
    activeNav,
    playSong,
    currentSong,
    isPlaying,
    togglePlayPause,
    allSongs,
  } = useApp()

  return (
    <section
      className="glass-panel p-6 lg:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      }}
    >
      {/* Active Navigation Info */}
      {activeNav !== 'Home' && (
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <h2 className="text-white text-xl font-bold mb-2">
            {activeNav}
          </h2>

          <p className="text-white/60 text-sm">
            Browse {activeNav.toLowerCase()} — content filtered for this
            section.
          </p>
        </div>
      )}

      {/* Section Heading */}
      {activeNav === 'Home' && (
        <div className="mb-5">
          <p className="text-white/40 text-xs uppercase tracking-[0.25em]">
            Explore
          </p>

          <div className="flex items-end justify-between gap-4">
            <h2 className="text-white text-2xl md:text-3xl font-bold mt-1">
              Browse your music
            </h2>

            <button
              onClick={() => setActiveNav('Songs')}
              className="hidden sm:block text-white/50 text-sm hover:text-white transition-colors"
            >
              View all →
            </button>
          </div>
        </div>
      )}

      {/* Category Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {CATEGORY_CARDS.map((card) => {
          const songsList = allSongs && allSongs.length > 0 ? allSongs : ALL_SONGS
          const demoSong =
            songsList.find((s) =>
              card.id === 'songs'
                ? true
                : String(s.id).includes(card.id.slice(0, 2)),
            ) || songsList[0]

          const isCurrent = currentSong?.id === demoSong.id
          const playing = isCurrent && isPlaying

          return (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveNav(card.navTarget)}
              onKeyDown={(e) =>
                e.key === 'Enter' && setActiveNav(card.navTarget)
              }
              className="
                relative
                rounded-3xl
                overflow-hidden
                h-64
                lg:h-72
                cursor-pointer
                group
                card-hover
              "
            >
              {/* Background Image */}
              <img
                src={resolveApiUrl(card.image)}
                alt={card.title}
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-110
                "
              />

              {/* Dark Gradient */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/90
                  via-black/45
                  to-black/10
                  transition-opacity
                  duration-300
                  group-hover:from-black/95
                "
              />

              {/* Card Content */}
              <div className="relative h-full flex flex-col justify-between p-5">
                
                {/* Badge */}
                <span
                  className="
                    self-start
                    px-3
                    py-1.5
                    rounded-full
                    bg-black/25
                    backdrop-blur-md
                    text-white/80
                    text-[11px]
                    font-medium
                    border
                    border-white/10
                  "
                >
                  {card.badge}
                </span>

                {/* Bottom Content */}
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-white text-xl md:text-2xl font-bold">
                      {card.title}
                    </h3>

                    <p className="text-white/60 text-xs md:text-sm mt-1 line-clamp-2 max-w-[190px]">
                      {card.description}
                    </p>

                    <p className="text-white/40 text-xs mt-2 italic">
                      Listen now...
                    </p>
                  </div>

                  {/* Play Button */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  >
                    <PlayButton
                      isPlaying={playing}
                      onClick={() =>
                        isCurrent
                          ? togglePlayPause()
                          : playSong(demoSong, songsList)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Hover Border */}
              <div
                className="
                  absolute
                  inset-0
                  rounded-3xl
                  border
                  border-white/0
                  group-hover:border-white/20
                  transition-colors
                  duration-300
                  pointer-events-none
                "
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}