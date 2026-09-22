import { useState } from 'react';
import { Play, SkipBack, SkipForward, Heart, Volume2 } from 'lucide-react';
import { formatTime } from '../data/musicData';
import { resolveApiUrl } from '../api/apiClient';

const DEFAULT_FALLBACK_ARTWORK = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400';

export function MusicCard3D({ song, index = 0, isHighlight = false }) {
  const [imgSrc, setImgSrc] = useState(resolveApiUrl(song?.artwork) || DEFAULT_FALLBACK_ARTWORK);
  const [imgError, setImgError] = useState(false);

  const title = song?.title || song?.song_name || `Track #${index + 1}`;
  const artist = song?.artist || song?.artist_name || 'AURA Music';
  const album = song?.album || song?.album_name || 'Featured Album';
  const durationSec = Number(song?.duration) || (180 + (index * 17) % 120);

  // Deterministic visual progress percentage
  const progressPercent = 30 + ((index * 13) % 45);
  const currentSec = Math.floor((durationSec * progressPercent) / 100);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(DEFAULT_FALLBACK_ARTWORK);
    }
  };

  return (
    <div
      className={`music-card-3d relative w-44 sm:w-52 md:w-56 rounded-2xl p-3.5 transition-all duration-300 pointer-events-none select-none overflow-hidden border flex flex-col gap-3 ${
        isHighlight
          ? 'bg-zinc-950/90 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)]'
          : 'bg-zinc-950/85 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
      }`}
      style={{
        boxShadow: isHighlight
          ? '0 25px 50px -10px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15)'
          : '0 20px 45px -10px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.08)',
      }}
    >
      {/* Subtle Multi-Color Border Shimmer for highlight cards */}
      {isHighlight && <div className="card-multi-glow" />}

      {/* Top subtle shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-black/50 pointer-events-none" />

      {/* Album Cover Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 shadow-md border border-white/5 group">
        <img
          src={imgSrc}
          alt={`${title} - ${artist}`}
          onError={handleImageError}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80" />

        {/* Album Badge overlay */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white/80 tracking-wider uppercase">
          {album}
        </div>
      </div>

      {/* Track Information */}
      <div className="relative z-10 flex flex-col gap-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white tracking-tight truncate drop-shadow-sm">
            {title}
          </h3>
          <Heart className={`w-3.5 h-3.5 shrink-0 ${index % 3 === 0 ? 'text-rose-500 fill-rose-500' : 'text-white/40'}`} />
        </div>
        <p className="text-xs text-zinc-400 truncate font-medium">
          {artist}
        </p>
      </div>

      {/* Visual Progress Bar (Non-functional) */}
      <div className="relative z-10 flex flex-col gap-1">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-zinc-300 via-rose-300/70 to-indigo-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
          <span>{formatTime(currentSec)}</span>
          <span>{formatTime(durationSec)}</span>
        </div>
      </div>

      {/* Visual Audio Controls (Non-functional) */}
      <div className="relative z-10 flex items-center justify-between pt-1 border-t border-white/5">
        <Volume2 className="w-3.5 h-3.5 text-white/40" />

        <div className="flex items-center gap-3">
          <SkipBack className="w-3.5 h-3.5 text-white/60" />
          <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-sm">
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          </div>
          <SkipForward className="w-3.5 h-3.5 text-white/60" />
        </div>

        <div className="w-2 h-2 rounded-full bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
      </div>
    </div>
  );
}

export default MusicCard3D;
