import { NAV_ITEMS } from '../../data/musicData'
import { useApp } from '../../context/AppContext'

export function Navigation() {
  const { activeNav, setActiveNav } = useApp()

  return (
    <nav className="hidden lg:flex items-center gap-5">
      {NAV_ITEMS.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setActiveNav(item)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeNav === item
              ? 'bg-white/15 text-white shadow-inner'
              : 'text-white/60 hover:text-white hover:bg-white/8'
          }`}
        >
          {item}
        </button>
      ))}
    </nav>
  )
}
