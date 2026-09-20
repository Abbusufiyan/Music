import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../../context/AppContext'

export function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    filteredSongs,
    playSong,
  } = useApp()

  const wrapperRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  })

  const updatePosition = () => {
    if (!wrapperRef.current) return

    const rect = wrapperRef.current.getBoundingClientRect()

    setDropdownPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    })
  }

  useEffect(() => {
    if (!searchQuery.trim()) return

    updatePosition()

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [searchQuery])

  return (
    <div
      ref={wrapperRef}
      className="relative flex-1 max-w-md"
    >
      {/* Search Input */}
      <div className="glass-input flex items-center gap-3 px-4 py-2.5 rounded-full">
        <Search
          size={18}
          className="text-white/50 shrink-0"
        />

        <input
          type="text"
          placeholder="Search Songs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-white placeholder:text-white/40 w-full text-sm"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-white/50 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results */}
      {searchQuery.trim() &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
            className="
              rounded-2xl
              p-2
              z-[999999]
              max-h-64
              overflow-y-auto
              custom-scrollbar
              glass-dropdown
              border-none
              shadow-2xl
            "
          >
            {filteredSongs.length === 0 ? (
              <p className="text-white/50 text-sm px-3 py-2">
                No songs found
              </p>
            ) : (
              filteredSongs.map((song) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => {
                    playSong(song, filteredSongs)
                    setSearchQuery('')
                  }}
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2
                    rounded-xl
                    hover:bg-white/10
                    transition-colors
                    text-left
                  "
                >
                  <img
                    src={song.artwork}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />

                  <div>
                    <p className="text-white text-sm font-medium">
                      {song.title}
                    </p>

                    <p className="text-white/50 text-xs">
                      {song.artist}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>,
          document.body
        )}
    </div>
  )
}