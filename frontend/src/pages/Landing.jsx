import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Disc, Music, Sparkles, ArrowRight, ShieldCheck, Zap, Volume2, UserCheck, LogIn } from 'lucide-react';
import SphereMatrix from '../components/Landing/SphereMatrix';
import { useApp } from '../context/AppContext';
import '../styles/Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { currentSong, isPlaying, togglePlayPause, isAuthenticated } = useApp();
  const [selectedPreviewSong, setSelectedPreviewSong] = useState(null);

  const handleStartListening = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05060a] text-white flex flex-col font-sans select-none">
      {/* 1. Dynamic Ambient Atmosphere Glowing Layers */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft violet glowing light orb */}
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tr from-violet-600/20 via-purple-600/15 to-transparent blur-[140px] mix-blend-screen" />
        
        {/* Deep blue ambient glow */}
        <div className="absolute bottom-0 right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-600/15 blur-[150px] mix-blend-screen" />
        
        {/* Subtle noise grain vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,6,10,0.85)_80%)]" />
      </div>

      {/* 2. Top Header Navigation Bar */}
      <header className="relative z-30 w-full px-6 md:px-12 py-5 flex items-center justify-between glass-header border-b border-white/10">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-0.5 shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0b0c14] rounded-[14px] flex items-center justify-center">
              <Disc className="w-5 h-5 text-violet-400 group-hover:rotate-180 transition-transform duration-700" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
              AURA
            </span>
            <span className="block text-[9px] text-violet-400 font-medium tracking-widest uppercase">
              STREAMING PLATFORM
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold glass-btn text-white/80 hover:text-white hover:bg-white/15 transition-all border border-white/10"
          >
            <LogIn size={14} />
            <span>Log In</span>
          </button>

          <button
            onClick={() => navigate(isAuthenticated ? '/home' : '/register')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-105 transition-all duration-300"
          >
            <Sparkles size={14} />
            <span>{isAuthenticated ? 'Open Player' : 'Get Started'}</span>
          </button>
        </div>
      </header>

      {/* 3. Main Body Container with 3D Sphere Matrix Background */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {/* 3D Sphere Matrix Grid Background Wall */}
        <div className="absolute inset-0 z-10">
          <SphereMatrix onSelectSong={(song) => setSelectedPreviewSong(song)} />
        </div>

        {/* Hero Overlay Center Banner */}
        <div className="relative z-20 pointer-events-auto max-w-2xl text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="glass-panel p-8 md:p-10 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-2xl bg-[#080910]/75 space-y-6"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30 shadow-inner">
              <Sparkles size={14} className="text-violet-400" />
              <span>SPHERE OF SOUND ENGINE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Immerse Yourself in <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-300 to-amber-300">
                Pure Audio Freedom
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Stream 50+ lossless high-definition tracks in spatial audio, curated discographies, and real-time playback synchronization.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={handleStartListening}
                className="flex items-center gap-3 bg-gradient-to-r from-white via-white to-white/90 text-black font-bold px-8 py-3.5 rounded-full text-sm shadow-2xl hover:bg-white/90 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <Play size={18} fill="currentColor" />
                <span>Start Listening Free</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 glass-btn px-6 py-3.5 rounded-full text-sm font-semibold text-white/90 border border-white/15 hover:bg-white/15 transition-all cursor-pointer"
              >
                <Music size={16} />
                <span>Explore Songs</span>
              </button>
            </div>

            {/* Feature Badges Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-6 sm:gap-10 text-xs text-white/60 font-medium">
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-violet-400" />
                <span>50+ HD Tracks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-fuchsia-400" />
                <span>Lossless Audio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck size={14} className="text-emerald-400" />
                <span>Zero Ads</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Mini Playing Audio Bar if music is currently playing */}
        <AnimatePresence>
          {currentSong && isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 z-40 glass-player p-3 pr-6 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-2xl flex items-center gap-4 bg-[#0d0e17]/90 max-w-sm"
            >
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                className="w-12 h-12 rounded-xl object-cover shadow-md border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                  <Volume2 size={12} className="animate-pulse" /> NOW PLAYING
                </p>
                <h4 className="text-white text-xs font-bold truncate">
                  {currentSong.title}
                </h4>
                <p className="text-white/60 text-[11px] truncate">
                  {currentSong.artist}
                </p>
              </div>

              <button
                onClick={togglePlayPause}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
