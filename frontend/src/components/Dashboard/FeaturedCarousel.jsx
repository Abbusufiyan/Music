import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Play, Pause } from 'lucide-react'
import { FEATURED_SLIDES } from '../../data/musicData'
import { useApp, findMatchingSong } from '../../context/AppContext'
import { resolveApiUrl } from '../../api/apiClient'

const AUTOPLAY_INTERVAL = 5000

export function FeaturedCarousel() {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef(null)

  const {
    playSong,
    togglePlayPause,
    currentSong,
    isPlaying,
    allSongs,
    addToLibrary,
    isInLibrary,
    setShowMoreMenu,
    showMoreMenu,
  } = useApp()

  const resolvedSlides = useMemo(() => {
    return FEATURED_SLIDES.map((slide) => {
      const dbMatch = findMatchingSong(slide.song, allSongs);
      return {
        ...slide,
        song: dbMatch || slide.song,
      };
    });
  }, [allSongs]);

  const slide = resolvedSlides[current] || FEATURED_SLIDES[current]
  const isCurrentSlide = currentSong?.id === slide.song.id
  const slidePlaying = isCurrentSlide && isPlaying

  const goTo = useCallback((index) => {
    setCurrent((index + resolvedSlides.length) % resolvedSlides.length)
  }, [resolvedSlides.length])

  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (isHovered) return
    timerRef.current = setInterval(goNext, AUTOPLAY_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [isHovered, goNext])

  const handlePlay = () => {
    if (isCurrentSlide) {
      togglePlayPause()
    } else {
      playSong(slide.song, resolvedSlides.map((s) => s.song))
    }
  }

  return (
    <div
      className="relative rounded-3xl overflow-hidden h-[280px] md:h-[320px] lg:h-[360px] group border border-white/10 shadow-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {FEATURED_SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            i === current
              ? 'opacity-100 translate-x-0 z-10'
              : i < current
                ? 'opacity-0 -translate-x-8 z-0'
                : 'opacity-0 translate-x-8 z-0'
          }`}
        >
          <img
            src={resolveApiUrl(s.image)}
            alt={s.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

          <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
            <span className="inline-flex self-start px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium mb-3 border border-white/10">
              {s.badge}
            </span>
            <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              {s.title}
            </h2>
            <p className="text-white/70 text-sm md:text-base max-w-lg mb-5 line-clamp-2">
              {s.description}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handlePlay}
                className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors"
              >
                {slidePlaying ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
                {slidePlaying ? 'Pause' : 'Play'}
              </button>

              <button
                type="button"
                onClick={() => addToLibrary(slide.song)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm border transition-colors ${
                  isInLibrary(slide.song.id)
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Plus size={16} />
                {isInLibrary(slide.song.id) ? 'In Library' : 'Add to Library'}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <MoreHorizontal size={18} />
                </button>
                {showMoreMenu && i === current && (
                  <div className="absolute bottom-full left-0 mb-2 glass-panel rounded-xl p-2 min-w-[140px] z-20">
                    {['Share', 'Download', 'Go to Artist'].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => setShowMoreMenu(false)}
                        className="w-full text-left px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-2 z-20">
        <button
          type="button"
          onClick={goPrev}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {FEATURED_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
