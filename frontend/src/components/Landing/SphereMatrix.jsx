import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Music, Sparkles, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ALL_SONGS } from '../../data/musicData';
import { resolveApiUrl } from '../../api/apiClient';

// Configuration for 3D Sphere Grid Matrix
const COLUMNS = 8;
const ROWS = 7;
const TOTAL_CARDS = COLUMNS * ROWS;

export default function SphereMatrix({ onSelectSong }) {
  const { allSongs, currentSong, isPlaying, playSong, togglePlayPause } = useApp();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);

  // Source list of songs with valid resolved artwork
  const songs = useMemo(() => {
    const source = allSongs && allSongs.length > 0 ? allSongs : ALL_SONGS;
    return source.map((s, idx) => ({
      ...s,
      artwork: s.artwork ? resolveApiUrl(s.artwork) : `/api/images/song/${s.id || idx + 1}?v=2`,
    }));
  }, [allSongs]);

  // Generate grid cards populated with DB songs
  const cardsData = useMemo(() => {
    if (songs.length === 0) return [];
    const list = [];
    for (let i = 0; i < TOTAL_CARDS; i++) {
      const song = songs[i % songs.length];
      const col = i % COLUMNS;
      const row = Math.floor(i / COLUMNS);
      list.push({
        id: i,
        col,
        row,
        song,
      });
    }
    return list;
  }, [songs]);

  // Mouse Parallax movement handler
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - left) / width - 0.5) * 2;
    const ny = ((e.clientY - top) / height - 0.5) * 2;
    setParallax({
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setParallax({ x: 0, y: 0 });
  }, []);

  // Compute 3D Sphere Transformation for each grid position
  const getCardStyle = (col, row, index) => {
    const centerCol = (COLUMNS - 1) / 2; // 3.5
    const centerRow = (ROWS - 1) / 2;    // 3

    const dx = col - centerCol;
    const dy = row - centerRow;

    // Euclidean distance from center of sphere
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Spherical Lens Curvature projection
    const translateZ = Math.max(-420, 80 - dist * 65);
    const rotateY = dx * -12 + parallax.x * 15;
    const rotateX = dy * 12 + parallax.y * -15;
    const scale = Math.max(0.62, 1.05 - dist * 0.075);
    const opacity = Math.max(0.35, 1 - dist * 0.1);
    const isHovered = hoveredIndex === index;

    return {
      transform: `perspective(1200px) translate3d(${dx * 215 + parallax.x * 35}px, ${dy * 260 + parallax.y * 35}px, ${translateZ + (isHovered ? 120 : 0)}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${isHovered ? scale * 1.15 : scale})`,
      opacity: isHovered ? 1 : opacity,
      zIndex: isHovered ? 100 : Math.round(100 - dist * 10),
    };
  };

  const handleCardClick = (song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      playSong(song, songs);
    }
    if (onSelectSong) onSelectSong(song);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full overflow-hidden flex items-center justify-center select-none"
      style={{ perspective: '1400px' }}
    >
      {/* Ambient Radial Vignette & Spherical Glow */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_20%,#05060a_85%)]" />

      {/* 3D Sphere Container Matrix */}
      <div className="relative w-full h-full flex items-center justify-center transform-style-3d transition-transform duration-700 ease-out">
        {cardsData.map((card, index) => {
          const { song, col, row } = card;
          const isCurrentTrack = currentSong?.id === song.id;
          const isTrackPlaying = isCurrentTrack && isPlaying;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={`sphere-card-${index}`}
              style={getCardStyle(col, row, index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleCardClick(song)}
              className="absolute w-[210px] sm:w-[220px] rounded-2xl p-3 cursor-pointer transition-all duration-300 ease-out glass-card border border-white/10 group shadow-2xl backdrop-blur-xl bg-[#0e0f18]/85 hover:border-violet-500/50 hover:shadow-violet-500/20"
            >
              {/* Card Header Tag */}
              <div className="flex items-center justify-between text-[10px] text-white/50 mb-2 font-medium tracking-wider uppercase">
                <span className="flex items-center gap-1 text-violet-400">
                  <Sparkles size={10} />
                  AURA
                </span>
                {isTrackPlaying ? (
                  <span className="flex items-center gap-1 text-emerald-400 animate-pulse font-semibold">
                    <Volume2 size={10} /> PLAYING
                  </span>
                ) : (
                  <span>STEREO</span>
                )}
              </div>

              {/* Album Cover Artwork */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 bg-black/40 group-hover:shadow-lg transition-all">
                <img
                  src={song.artwork}
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop';
                  }}
                />

                {/* Hover Play Button Overlay */}
                <div
                  className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center ${
                    isTrackPlaying || isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110">
                    {isTrackPlaying ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Track Title & Subtitle (Matching Reference Image "Listening on AURA") */}
              <div className="space-y-0.5 mb-2">
                <h4
                  className="text-white font-bold text-xs truncate group-hover:text-violet-300 transition-colors"
                  title={song.title}
                >
                  {song.title}
                </h4>
                <p className="text-white/50 text-[11px] truncate font-medium">
                  {song.artist && song.artist !== 'Google Drive Music'
                    ? song.artist
                    : 'Listening on AURA'}
                </p>
              </div>

              {/* Mini Audio Controls & Progress Bar (Exact Match to Reference Card Anatomy) */}
              <div className="space-y-1.5 pt-1 border-t border-white/10">
                {/* Micro Progress Bar */}
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isTrackPlaying
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 w-3/4 animate-pulse'
                        : 'bg-white/30 w-1/3 group-hover:bg-violet-400'
                    }`}
                  />
                </div>

                {/* Progress Time & Media Controls */}
                <div className="flex items-center justify-between text-[9px] text-white/40 font-mono">
                  <span>1:48</span>
                  <div className="flex items-center gap-1.5 text-white/70">
                    <SkipBack size={10} className="hover:text-white" />
                    {isTrackPlaying ? (
                      <Pause size={10} className="text-emerald-400 fill-current" />
                    ) : (
                      <Play size={10} className="hover:text-white fill-current" />
                    )}
                    <SkipForward size={10} className="hover:text-white" />
                  </div>
                  <span>-2:18</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
