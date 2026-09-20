import { NewReleases } from './NewReleases'
import { RecentlyPlayed } from './RecentlyPlayed'
import { MinimizedPlayerCard } from '../MusicPlayer/MusicPlayer'
import { NAV_ITEMS } from '../../data/musicData'
import { useApp } from '../../context/AppContext'

export function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    activeNav,
    setActiveNav,
    currentSong,
    isPlayerExpanded,
  } = useApp()

  const showMinimizedPlayer = currentSong && !isPlayerExpanded && activeNav !== 'Songs'

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          left-sidebar absolute lg:static inset-y-0 left-0 z-30
          w-72 shrink-0 flex flex-col h-full overflow-y-auto custom-scrollbar gap-4 pb-1
          bg-black/60 backdrop-blur-2xl lg:bg-transparent lg:backdrop-blur-none
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0 p-4' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="lg:hidden flex flex-wrap gap-2 shrink-0 mb-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveNav(item)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeNav === item
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white bg-white/5'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Box 1: New Releases Glass Box */}
        <div className="shrink-0">
          <NewReleases />
        </div>

        {/* Box 2: Recently Played Glass Box */}
        <div className="flex-1 min-h-0 flex flex-col">
          <RecentlyPlayed />
        </div>

        {/* Box 3: Minimized Music Player (Fits neatly below Recently Played with zero overlap) */}
        {showMinimizedPlayer && (
          <div className="shrink-0 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <MinimizedPlayerCard />
          </div>
        )}
      </aside>
    </>
  )
}
