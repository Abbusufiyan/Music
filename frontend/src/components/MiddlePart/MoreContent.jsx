import { useApp } from '../../context/AppContext'
import { Info, HelpCircle, Shield, Award, Sparkles, User, Settings } from 'lucide-react'

export default function MoreContent() {
  const { setActiveNav, userProfile } = useApp()

  return (
    <div className="pb-16 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">More & Account Options</h1>
        <p className="text-white/60">Explore app options, shortcuts, and account features.</p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => setActiveNav('Profile')}
          className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <User size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">My Profile</h3>
              <p className="text-white/50 text-xs mt-0.5">View your activity, playlists, and liked songs</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveNav('Settings')}
          className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Account Settings</h3>
              <p className="text-white/50 text-xs mt-0.5">Audio quality, profile details & preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* About StreamWave */}
      <section className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Sparkles size={20} className="text-white/80" />
          <h2 className="text-xl font-semibold text-white">About StreamWave</h2>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">
          StreamWave is a full-stack music streaming platform designed with React, Vite, Express, and MySQL. Stream high-quality audio, create custom playlists, and discover trending music anywhere.
        </p>
        <div className="flex items-center gap-4 pt-2 text-xs text-white/40">
          <span>Version: 1.0.0</span>
          <span>•</span>
          <span>Status: Fully Connected & Integrated</span>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <HelpCircle size={20} className="text-white/80" />
          <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-white/70">Play / Pause</span>
            <kbd className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">Space</kbd>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-white/70">Seek Forward</span>
            <kbd className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">→</kbd>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-white/70">Seek Backward</span>
            <kbd className="bg-white/10 px-2 py-0.5 rounded text-xs text-white">←</kbd>
          </div>
        </div>
      </section>
    </div>
  )
}