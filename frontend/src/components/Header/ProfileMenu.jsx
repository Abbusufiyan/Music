import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export function ProfileMenu() {
  const { profileOpen, setProfileOpen, setNotificationOpen, userProfile, setActiveNav, logout } = useApp()
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })

  // Custom click-outside logic that accounts for portaled dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!profileOpen) return
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [profileOpen, setProfileOpen])

  useEffect(() => {
    if (profileOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
  }, [profileOpen])

  const handleAction = (label) => {
    setProfileOpen(false)
    if (label === 'Profile') {
      setActiveNav('Profile')
      navigate('/home')
    } else if (label === 'Settings') {
      setActiveNav('Settings')
      navigate('/home')
    } else if (label === 'Sign Out') {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="relative" ref={buttonRef}>
      <button
        type="button"
        onClick={() => {
          setProfileOpen(!profileOpen)
          setNotificationOpen(false)
        }}
        className="flex items-center gap-2 glass-btn rounded-full pl-1.5 pr-3 py-1.5 hover:bg-white/15 transition-colors cursor-pointer"
      >
        <img
          src={userProfile.avatarUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
        />
        <span className="text-white text-sm font-medium hidden sm:block">
          {userProfile.name}
        </span>
        <ChevronDown
          size={16}
          className={`text-white/60 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {profileOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              right: dropdownPos.right,
            }}
            className="w-52 glass-dropdown rounded-2xl p-2 z-[999999] shadow-2xl border-none"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-white text-sm font-medium">{userProfile.name}</p>
              <p className="text-white/40 text-xs">{userProfile.username}</p>
            </div>
            {[
              { icon: User, label: 'Profile' },
              { icon: Settings, label: 'Settings' },
              { icon: LogOut, label: 'Sign Out' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleAction(label)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm cursor-pointer"
              >
                <Icon size={16} className="shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}