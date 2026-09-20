import { useState, useMemo, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { ARTISTS } from '../../data/musicData'
import SongCard from './SongCard'
import { Edit2, Play, Music, ListMusic, Heart, Clock, X, Camera, Upload } from 'lucide-react'

export default function ProfileContent() {
  const { userProfile, updateProfile, playlists, likedSongs, recentActivity, playSong, allSongs } = useApp()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState({ name: '', username: '', bio: '', avatarUrl: '' })

  const fileInputRef = useRef(null)
  const modalFileInputRef = useRef(null)

  const handleOpenEdit = () => {
    setEditData(userProfile)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    updateProfile(editData)
    setIsEditOpen(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (dataUrl) {
        updateProfile({ avatarUrl: dataUrl })
        setEditData(prev => ({ ...prev, avatarUrl: dataUrl }))
      }
    }
    reader.readAsDataURL(file)
  }

  const totalSongsInPlaylists = useMemo(() => {
    return playlists.reduce((acc, pl) => acc + pl.songIds.length, 0)
  }, [playlists])

  const topArtists = useMemo(() => {
    return ARTISTS.slice(0, 5)
  }, [])

  return (
    <div className="pb-16 space-y-12">
      
      {/* 1. PROFILE HEADER */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Avatar with Local Upload Overlay */}
          <div 
            className="relative group cursor-pointer shrink-0" 
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload profile picture"
          >
            <img 
              src={userProfile.avatarUrl} 
              alt={userProfile.name} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-2xl border-2 border-white/20 transition-all duration-300 group-hover:brightness-75"
            />
            <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium gap-1">
              <Camera size={24} />
              <span>Change Photo</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/jpeg,image/png,image/webp,image/jpg" 
              className="hidden" 
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{userProfile.name}</h1>
              <p className="text-white/60 text-lg">{userProfile.username}</p>
            </div>
            
            <p className="text-white/80 italic text-lg border-l-2 border-white/20 pl-4 py-1">"{userProfile.bio}"</p>
            
            <button 
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full font-medium transition-colors border border-white/10 cursor-pointer"
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          </div>

          <div className="flex gap-6 shrink-0 mt-6 md:mt-0 bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{likedSongs.length + totalSongsInPlaylists}</div>
              <div className="text-white/50 text-xs uppercase tracking-wider">Total Songs</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{playlists.length}</div>
              <div className="text-white/50 text-xs uppercase tracking-wider">Playlists</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{likedSongs.length}</div>
              <div className="text-white/50 text-xs uppercase tracking-wider">Liked Songs</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. YOUR PLAYLISTS */}
      <section>
        <div className="flex items-center gap-2 mb-6 px-1">
          <ListMusic size={20} className="text-white/80" />
          <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
        </div>
        
        {playlists.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-white/50 border border-white/5">
            You haven't created any playlists yet. Head to the Playlists tab to get started!
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar">
            {playlists.map(pl => {
              const firstSongId = pl.songIds[0]
              const firstSong = firstSongId ? allSongs.find(s => String(s.id) === String(firstSongId)) : null
              const coverImg = firstSong ? firstSong.artwork : 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=200&h=200'

              return (
                <div key={pl.id} className="glass-panel p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer group w-[180px] shrink-0 relative">
                  <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg">
                    <img src={coverImg} alt={pl.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          if (firstSong) playSong(firstSong)
                        }}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg hover:bg-white/30 transition-colors transform hover:scale-105"
                      >
                        <Play size={22} fill="currentColor" className="ml-1" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-white font-medium truncate">{pl.name}</h3>
                  <p className="text-white/50 text-sm mt-1">{pl.songIds.length} songs</p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 3. LIKED SONGS */}
      <section>
        <div className="flex items-center gap-2 mb-6 px-1">
          <Heart size={20} className="text-rose-400 fill-rose-400/20" />
          <h2 className="text-2xl font-bold text-white">Liked Songs</h2>
          <span className="text-white/40 text-sm font-medium ml-1">({likedSongs.length})</span>
        </div>

        {likedSongs.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-white/50 border border-white/5">
            You haven't liked any songs yet. Click the heart icon on any song to add it here!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
            {likedSongs.slice().reverse().map(id => {
              const song = allSongs.find(s => String(s.id) === String(id))
              return song ? <SongCard key={song.id} song={song} /> : null
            })}
          </div>
        )}
      </section>

      {/* 4. RECENT ACTIVITY & TOP ARTISTS ROW */}
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* Recent Activity */}
        <section className="flex-1 glass-panel rounded-3xl p-6 md:p-8 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-white/80" />
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {recentActivity.length === 0 ? (
              <p className="text-white/40">No recent activity.</p>
            ) : (
              recentActivity.map(act => (
                <div key={act.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                  {act.image ? (
                    <img src={act.image} alt="Activity" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                      <Music size={20} className="text-white/50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white/90 text-sm font-medium">{act.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Top Artists */}
        <section className="flex-1 glass-panel rounded-3xl p-6 md:p-8 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-white">Top Artists</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {topArtists.map(artist => (
              <div key={artist.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <img src={artist.image} alt={artist.name} className="w-12 h-12 rounded-full object-cover" />
                <p className="text-white/90 text-sm font-medium truncate">{artist.name}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/20 shadow-2xl relative">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Avatar Image</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={editData.avatarUrl}
                    onChange={e => setEditData({...editData, avatarUrl: e.target.value})}
                    placeholder="URL or select local image"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/40 transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 rounded-lg text-xs font-medium border border-white/20 shrink-0 transition-colors cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Upload</span>
                  </button>
                  <input 
                    type="file" 
                    ref={modalFileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg,image/png,image/webp,image/jpg" 
                    className="hidden" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Username</label>
                <input 
                  type="text" 
                  value={editData.username}
                  onChange={e => setEditData({...editData, username: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Bio</label>
                <textarea 
                  value={editData.bio}
                  onChange={e => setEditData({...editData, bio: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/40 transition-colors resize-none h-24"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsEditOpen(false)}
                className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
