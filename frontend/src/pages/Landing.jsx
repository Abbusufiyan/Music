import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ALL_SONGS as FALLBACK_SONGS } from '../data/musicData';
import MusicTunnel3D from '../components/MusicTunnel3D';
import '../styles/Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { allSongs } = useApp() || {};

  // Combine songs from backend/AppContext with fallbacks for dense coverage
  const songsList = useMemo(() => {
    const list = Array.isArray(allSongs) && allSongs.length > 0 ? allSongs : FALLBACK_SONGS;
    if (list.length < 16) {
      return [...list, ...FALLBACK_SONGS, ...list];
    }
    return list;
  }, [allSongs]);

  const handleEnterLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div
      className="landing-page-container fixed inset-0 w-screen h-screen bg-[#030304] text-white overflow-hidden cursor-pointer select-none"
      onClick={handleEnterLogin}
      role="button"
      tabIndex={0}
      aria-label="Click anywhere to enter AURA Music"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEnterLogin();
        }
      }}
    >
      {/* Dynamic Multi-Color Ambient Shadow Layer across different screen portions */}
      <div className="landing__atmosphere pointer-events-none absolute inset-0 z-0">
        {/* Top-Left Portion: Shifting Rose -> Amber -> Violet */}
        <div className="ambient-glow ambient-glow--tl" />

        {/* Top-Right Portion: Shifting Purple -> Cyan -> Sapphire */}
        <div className="ambient-glow ambient-glow--tr" />

        {/* Bottom-Left Portion: Shifting Teal -> Emerald -> Indigo */}
        <div className="ambient-glow ambient-glow--bl" />

        {/* Bottom-Right Portion: Shifting Fuchsia -> Coral -> Deep Purple */}
        <div className="ambient-glow ambient-glow--br" />

        <div className="landing__vignette" />
        <div className="landing__grain" />
      </div>

      {/* Main 3D Convex Music Wall Canvas (Full Viewport Coverage) */}
      <div className="relative z-10 w-full h-full">
        <MusicTunnel3D songs={songsList} />
      </div>
    </div>
  );
}
