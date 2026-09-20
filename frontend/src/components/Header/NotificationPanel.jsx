import { Bell } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NOTIFICATIONS } from '../../data/musicData'
import { useApp } from '../../context/AppContext'

export function NotificationPanel() {
  const { notificationOpen, setNotificationOpen, setProfileOpen } = useApp()
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!notificationOpen) return
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [notificationOpen, setNotificationOpen])

  useEffect(() => {
    if (notificationOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()

      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
  }, [notificationOpen])

  return (
    <div className="relative" ref={buttonRef}>
      <button
        type="button"
        onClick={() => {
          setNotificationOpen(!notificationOpen)
          setProfileOpen(false)
        }}
        className="relative w-10 h-10 rounded-full glass-btn flex items-center justify-center hover:bg-white/15 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-white/80" />

        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#2a1b15]" />
      </button>

      {notificationOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              right: dropdownPos.right,
            }}
            className="w-80 glass-dropdown rounded-2xl p-4 z-[999999] shadow-2xl border-none"
          >
            <h3 className="text-white font-semibold mb-3">
              Notifications
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
              {NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-white text-sm font-medium">
                      {n.title}
                    </p>

                    <span className="text-white/40 text-xs shrink-0">
                      {n.time}
                    </span>
                  </div>

                  <p className="text-white/50 text-xs mt-1">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}