import { Pause, Play } from 'lucide-react'

export function PlayButton({
  isPlaying = false,
  onClick,
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }
  const iconSizes = { sm: 14, md: 18, lg: 22 }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      className={`${sizes[size]} rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 shrink-0 ${className}`}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? (
        <Pause size={iconSizes[size]} fill="currentColor" />
      ) : (
        <Play size={iconSizes[size]} fill="currentColor" className="ml-0.5" />
      )}
    </button>
  )
}
