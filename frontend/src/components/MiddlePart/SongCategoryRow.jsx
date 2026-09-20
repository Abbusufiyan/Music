import SongCard from './SongCard'

export default function SongCategoryRow({ title, songs }) {
  if (!songs || songs.length === 0) return null

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4 px-1">{title}</h2>
      {/* Horizontal scrolling carousel with fixed card width wrappers */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar">
        {songs.map((song, idx) => (
          <div key={`${song.id}-${idx}`} className="w-[180px] sm:w-[195px] shrink-0">
            <SongCard song={song} />
          </div>
        ))}
      </div>
    </div>
  )
}
