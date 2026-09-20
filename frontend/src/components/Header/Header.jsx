import { Menu, X } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { Navigation } from './Navigation'
import { NotificationPanel } from './NotificationPanel'
import { ProfileMenu } from './ProfileMenu'
import { useApp } from '../../context/AppContext'

export function Header() {
  const { sidebarOpen, setSidebarOpen } = useApp()

  return (

    <header className="relative shrink-0 px-4 md:px-6 pt-4 pb-2 flex items-center gap-3">
      
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden w-10 h-10 rounded-full glass-btn flex items-center justify-center hover:bg-white/15 transition-colors"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? (
          <X size={20} className="text-white" />
        ) : (
          <Menu size={20} className="text-white" />
        )}
      </button>

      <SearchBar />

      <div className="absolute left-1/2 -translate-x-1/2">
        <Navigation />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <NotificationPanel />
        <ProfileMenu />
      </div>

    </header>
  )
}
