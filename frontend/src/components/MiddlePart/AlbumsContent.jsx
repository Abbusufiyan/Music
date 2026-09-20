import { useState, useMemo } from 'react'
import { ALBUMS, ALL_SONGS } from '../../data/musicData'
import { useApp } from '../../context/AppContext'
import SongCategoryRow from './SongCategoryRow'
import { ArrowLeft, Play } from 'lucide-react'

function matchSongToAlbum(song, album) {
  if (!song || !album) return false
  if (song.albumId && album.id && String(song.albumId) === String(album.id)) {
    return true
  }
  const songAlb = (song.album || song.albumName || '').trim().toLowerCase()
  const albTitle = (album.title || album.name || '').trim().toLowerCase()
  if (!songAlb || !albTitle) return false
  return songAlb === albTitle || songAlb.includes(albTitle) || albTitle.includes(songAlb)
}

export default function AlbumsContent() {
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const { allSongs } = useApp()

  const songsSource = allSongs && allSongs.length > 0 ? allSongs : ALL_SONGS

  const dynamicAlbums = useMemo(() => {
    if (!songsSource || songsSource.length === 0) return ALBUMS

    const albumsMap = new Map()
    let counter = 1

    songsSource.forEach(s => {
      const albTitle = s.album || s.albumName || 'Single'
      if (!albumsMap.has(albTitle)) {
        albumsMap.set(albTitle, {
          id: `alb-${counter++}`,
          title: albTitle,
          artist: s.artist || 'Various Artists',
          cover: s.artwork || 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=400&fit=crop'
        })
      }
    })

    return Array.from(albumsMap.values())
  }, [songsSource])

  const albumSongs = useMemo(() => {
    if (!selectedAlbum) return []
    return songsSource.filter(s => matchSongToAlbum(s, selectedAlbum))
  }, [selectedAlbum, songsSource])

  if (selectedAlbum) {
    return (
      <div className="pb-16">
        <button 
          onClick={() => setSelectedAlbum(null)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Albums
        </button>

        <div className="flex items-center gap-6 mb-10">
          <img 
            src={selectedAlbum.cover} 
            alt={selectedAlbum.title} 
            className="w-32 h-32 rounded-2xl object-cover shadow-2xl border border-white/10"
          />
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{selectedAlbum.title}</h1>
            <p className="text-white/60 text-lg mb-1">{selectedAlbum.artist}</p>
            <p className="text-white/40 text-sm">{albumSongs.length} Songs</p>
          </div>
        </div>

        {albumSongs.length > 0 ? (
          <SongCategoryRow title={`Songs in ${selectedAlbum.title}`} songs={albumSongs} />
        ) : (
          <div className="glass-panel p-8 rounded-2xl text-center border border-white/10 my-6 max-w-md">
            <p className="text-white/60 text-base">No songs available for this album.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Albums</h1>
        <p className="text-white/60">Browse full albums and complete discographies.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {dynamicAlbums.map((album) => (
          <div
            key={album.id}
            onClick={() => setSelectedAlbum(album)}
            className="glass-panel p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] cursor-pointer group shrink-0"
          >
            <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg shadow-md border border-white/10">
              <img
                src={album.cover}
                alt={album.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/30 flex items-center gap-1">
                  <Play size={12} fill="currentColor" /> View Album
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-white font-medium truncate text-[15px]" title={album.title}>
                {album.title}
              </h3>
              <p className="text-white/60 truncate text-[13px]" title={album.artist}>
                {album.artist}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}