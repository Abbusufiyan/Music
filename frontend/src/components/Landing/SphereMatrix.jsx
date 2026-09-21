import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Sparkles, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ALL_SONGS } from '../../data/musicData';
import { resolveApiUrl } from '../../api/apiClient';

// 9 Columns x 7 Rows = 63 Dense Cards for full-bleed 3D Sphere Wall
const COLUMNS = 9;
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

  // Generate grid cards populated with real DB songs
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

  // Precise 3D Spherical Lens Matrix Projection
  const getCardStyle = (col, row, index) => {
    const centerCol = (COLUMNS - 1) / 2; // 4
    const centerRow = (ROWS - 1) / 2;    // 3

    const dx = col - centerCol;
    const dy = row - centerRow;

    // Distance from center of sphere
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Spherical curvature math matching reference image
    const translateZ = Math.max(-480, 110 - dist * 68);
    const rotateY = dx * -13.5 + parallax.x * 14;
    const rotateX = dy * 13.5 + parallax.y * -14;
    const scale = Math.max(0.58, 1.06 - dist * 0.068);
    const opacity = Math.max(0.32, 1 - dist * 0.09);
    const isHovered = hoveredIndex === index;

    return {
      transform: `perspective(1300px) translate3d(${dx * 205 + parallax.x * 32}px, ${dy * 245 + parallax.y * 32}px, ${translateZ + (isHovered ? 130 : 0)}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${isHovered ? scale * 1.14 : scale})`,
      opacity: isHovered ? 1 : opacity,
      zIndex: isHovered ? 120 : Math.round(100 - dist * 10),
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
      className="relative w-full h-full overflow-hidden flex items-center justify-center select-none bg-[#040508]"
      style={{ perspective: '1400px' }}
    >
      {/* Dark Spherical Vignette Background Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_15%,#040508_85%)]" />

      {/* 3D Sphere Container Grid */}
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
              className="absolute w-[195px] sm:w-[205px] rounded-2xl p-2.5 cursor-pointer transition-all duration-300 ease-out glass-card border border-white/12 group shadow-2xl backdrop-blur-xl bg-[#10111d]/90 hover:border-violet-500/60 hover:shadow-violet-500/25"
            >
              {/* Card Header Status */}
              <div className="flex items-center justify-between text-[9px] text-white/40 mb-1.5 font-medium tracking-wider uppercase">
                <span className="flex items-center gap-1 text-violet-400 font-semibold">
                  <Sparkles size={9} />
                  AURA
                </span>
                {isTrackPlaying ? (
                  <span className="flex items-center gap-1 text-emerald-400 animate-pulse font-semibold">
                    <Volume2 size={9} /> PLAYING
                  </span>
                ) : (
                  <span>STEREO</span>
                )}
              </div>

              {/* Album Cover Artwork */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-black/50 shadow-md">
                <img
                  src={song.artwork}
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop';
                  }}
                />

                {/* Hover / Active Play Button Overlay */}
                <div
                  className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center ${
                    isTrackPlaying || isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
                    {isTrackPlaying ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Track Title & Artist (Matching Reference "Listening on AURA" pattern) */}
              <div className="space-y-0.5 mb-1.5">
                <h4
                  className="text-white font-bold text-xs truncate uppercase tracking-tight group-hover:text-violet-300 transition-colors"
                  title={song.title}
                >
                  {song.title}
                </h4>
                <p className="text-white/50 text-[10px] truncate font-medium tracking-wide">
                  {song.artist && song.artist !== 'Google Drive Music'
                    ? `Listening on ${song.artist}`
                    : 'Listening on AURA'}
                </p>
              </div>

              {/* Micro Player Controls & Track Line (Matching Reference Card Details) */}
              <div className="space-y-1 pt-1 border-t border-white/10">
                {/* Progress Bar Track */}
                <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isTrackPlaying
                        ? 'bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 w-3/4 animate-pulse'
                        : 'bg-white/40 w-1/3 group-hover:bg-violet-400'
                    }`}
                  />
                </div>

                {/* Progress Time & Media Controls */}
                <div className="flex items-center justify-between text-[8.5px] text-white/40 font-mono">
                  <span>1:48</span>
                  <div className="flex items-center gap-1 text-white/70">
                    <SkipBack size={9} className="hover:text-white" />
                    {isTrackPlaying ? (
                      <Pause size={9} className="text-emerald-400 fill-current" />
                    ) : (
                      <Play size={9} className="hover:text-white fill-current" />
                    )}
                    <SkipForward size={9} className="hover:text-white" />
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
