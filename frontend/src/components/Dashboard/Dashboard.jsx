import { Sidebar } from './Sidebar'
import { ContentSwitcher } from '../MiddlePart/ContentSwitcher'
import NowPlayingPanel from '../MiddlePart/NowPlayingPanel'
import ArtistCardWidget from '../MiddlePart/ArtistCardWidget'
import { useApp } from '../../context/AppContext'

export function Dashboard() {
  const { activeNav } = useApp()
  const isSongsPage = activeNav === 'Songs'

  return (
    <div className="flex flex-1 min-h-0 px-4 md:px-6 py-2 gap-6 lg:gap-8 overflow-hidden">
      {/* 1. Left Sidebar (Two Separate Glass Boxes) */}
      <Sidebar />

      {/* 2. Main Center Content Area */}
      <main className="main-content flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
        <ContentSwitcher />
      </main>

      {/* 3. Right Sidebar (ONLY on Songs page on desktop) */}
      {isSongsPage && (
        <aside className="right-sidebar hidden xl:flex flex-col justify-center gap-5 shrink-0 w-80 h-full overflow-y-auto custom-scrollbar py-2">
          <NowPlayingPanel />
          <ArtistCardWidget />
        </aside>
      )}
    </div>
  )
}



