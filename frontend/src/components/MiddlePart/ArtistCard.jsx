import { Star } from 'lucide-react'
import { resolveApiUrl } from '../../api/apiClient'

export default function ArtistCard({ artist, onClick }) {
  if (!artist) return null

  return (
    <div
      onClick={() => onClick && onClick(artist)}
      className="
        group
        relative
        flex
        flex-col
        h-full
        p-4
        rounded-2xl
        cursor-pointer
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:bg-white/[0.09]
        hover:border-white/20
        hover:shadow-2xl
        hover:shadow-black/40
      "
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
      }}
    >
      {/* 1. Artist Image */}
      <div className="relative w-full aspect-square mb-3.5 overflow-hidden rounded-xl bg-white/5 shrink-0">
        <img
          src={resolveApiUrl(artist.image)}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'
          }}
        />

        {/* Hover overlay with glass View button */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <span className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-semibold border border-white/30 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            View Profile
          </span>
        </div>
      </div>

      {/* 2. Artist Details & Bio Container (equal height) */}
      <div className="flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {/* Artist Name */}
          <h3
            className="text-white font-bold text-base line-clamp-1 group-hover:text-white/90 transition-colors"
            title={artist.name}
          >
            {artist.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-amber-300/90 text-xs font-semibold">
              {artist.rating ? artist.rating.toFixed(1) : '4.9'}
            </span>
          </div>
        </div>

        {/* Short 2-3 line biography */}
        <p className="text-white/60 text-xs leading-relaxed line-clamp-2 md:line-clamp-3 mt-1 min-h-[2.5rem]">
          {artist.bio ||
            'Renowned music artist known for hit singles and popular albums.'}
        </p>
      </div>
    </div>
  )
}
