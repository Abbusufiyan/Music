import SongCard from './SongCard'
import { resolveApiUrl } from '../../api/apiClient'

export default function AlbumRow({ album, artist, songs }) {
  if (!songs || songs.length === 0) return null

  return (
    <div className="mb-12 flex flex-col md:flex-row gap-6">
      {/* Album Info */}
      <div className="w-full md:w-64 shrink-0">
        <div className="glass-panel p-4 rounded-xl border border-white/10 sticky top-6">
          <img 
            src={resolveApiUrl(album.cover)} 
            alt={album.title} 
            className="w-full aspect-square object-cover rounded-lg mb-4 shadow-md" 
          />
          <h2 className="text-xl font-bold text-white mb-1 truncate">{album.title}</h2>
          <p className="text-white/60 text-sm truncate">{artist ? artist.name : 'Unknown Artist'}</p>
          <p className="text-white/40 text-xs mt-2">{songs.length} Songs</p>
        </div>
      </div>

      {/* Songs Row */}
      <div className="flex-1 min-w-0">
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar">
          {songs.map((song, idx) => (
            <SongCard key={`${song.id}-${idx}`} song={song} />
          ))}
        </div>
      </div>
    </div>
  )
}
