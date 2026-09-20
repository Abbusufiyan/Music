import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { User, Bell, Shield, Volume2, Moon } from 'lucide-react'

export default function SettingsContent() {
  const { userProfile, updateProfile } = useApp()
  const [notifications, setNotifications] = useState(true)
  const [audioQuality, setAudioQuality] = useState('High')
  const [savedMessage, setSavedMessage] = useState('')

  const handleSave = () => {
    setSavedMessage('Settings saved successfully!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <div className="pb-16 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-white/60">Manage your profile, preferences, and security.</p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-200 text-sm">
          {savedMessage}
        </div>
      )}

      {/* Account Profile Section */}
      <section className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <User size={20} className="text-white/80" />
          <h2 className="text-xl font-semibold text-white">Profile Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Display Name
            </label>
            <input 
              type="text" 
              value={userProfile.name} 
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Username
            </label>
            <input 
              type="text" 
              value={userProfile.username} 
              onChange={(e) => updateProfile({ username: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/40"
            />
          </div>
        </div>
      </section>

      {/* Playback & Audio */}
      <section className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Volume2 size={20} className="text-white/80" />
          <h2 className="text-xl font-semibold text-white">Audio & Playback</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium text-sm">Audio Quality</p>
            <p className="text-white/50 text-xs mt-0.5">Select your preferred streaming audio bitrate.</p>
          </div>
          <select 
            value={audioQuality} 
            onChange={(e) => setAudioQuality(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
          >
            <option value="Normal" className="bg-[#1a1a1a]">Normal (128 kbps)</option>
            <option value="High" className="bg-[#1a1a1a]">High (256 kbps)</option>
            <option value="Very High" className="bg-[#1a1a1a]">Very High (320 kbps)</option>
          </select>
        </div>
      </section>

      {/* Notifications */}
      <section className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Bell size={20} className="text-white/80" />
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium text-sm">Push Notifications</p>
            <p className="text-white/50 text-xs mt-0.5">Receive alerts for new music releases and playlist updates.</p>
          </div>
          <button 
            type="button"
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-white/30' : 'bg-white/10'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${notifications ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      </section>

      <div className="flex justify-end">
        <button 
          type="button" 
          onClick={handleSave}
          className="bg-white text-black px-6 py-2.5 rounded-full font-semibold hover:scale-105 transition-transform"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
