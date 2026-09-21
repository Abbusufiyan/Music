import { resolveApiUrl } from '../api/apiClient'

export const NAV_ITEMS = ['Home', 'Songs','Artists', 'Albums', 'Playlists', 'More']

export const FEATURED_SLIDES = [
  {
    id: 1,
    badge: 'Featured Music',
    title: 'Nadaan Parinde',
    description: 'Listen to A.R. Rahman and Mohit Chauhan’s timeless masterpiece.',
    image: resolveApiUrl('/api/images/home/cover image for home'),
    song: {
      id: 'nadan-1',
      title: 'Nadaan Parinde',
      artist: 'A.R. Rahman / Mohit Chauhan',
      duration: 385,
      audioUrl: resolveApiUrl('/api/songs/26/stream'),
      artwork: resolveApiUrl('/api/images/song/nadan parinde'),
    },
  },
  {
    id: 2,
    badge: 'New Release',
    title: 'Khat',
    description: 'Experience the new track by Arijit Singh.',
    image: resolveApiUrl('/api/images/home/consert1'),
    song: {
      id: 'khat-1',
      title: 'Khat',
      artist: 'Arijit Singh',
      duration: 245,
      audioUrl: resolveApiUrl('/api/songs/28/stream'),
      artwork: resolveApiUrl('/api/images/song/khat'),
    },
  },
  {
    id: 3,
    badge: 'Trending',
    title: 'Samjhawa',
    description: 'The iconic romantic hit by Arijit Singh & Shreya Ghoshal.',
    image: resolveApiUrl('/api/images/home/consert2'),
    song: {
      id: 'samjhawa-1',
      title: 'Samjhawa',
      artist: 'Arijit Singh / Shreya Ghoshal',
      duration: 269,
      audioUrl: resolveApiUrl('/api/songs/30/stream'),
      artwork: resolveApiUrl('/api/images/song/samjhawa'),
    },
  },
  {
    id: 4,
    badge: 'For You',
    title: 'Tum Hi Ho',
    description: 'Music selected based on your listening activity.',
    image: resolveApiUrl('/api/images/home/consert3'),
    song: {
      id: '31',
      title: 'Tum Hi Ho',
      artist: 'Arijit Singh',
      duration: 262,
      audioUrl: resolveApiUrl('/api/songs/31/stream'),
      artwork: resolveApiUrl('/api/images/song/31'),
    },
  },
]

export const NEW_RELEASES = [
  {
    id: 'nr-khat',
    title: 'Khat',
    subtitle: 'Arijit Singh',
    image: resolveApiUrl('/api/images/song/khat'),
    song: {
      id: 'khat-1',
      title: 'Khat',
      artist: 'Arijit Singh',
      duration: 245,
      audioUrl: resolveApiUrl('/api/songs/28/stream'),
      artwork: resolveApiUrl('/api/images/song/khat'),
    },
  },
  {
    id: 'nr-nadan',
    title: 'Nadaan Parinde',
    subtitle: 'A.R. Rahman / Mohit Chauhan',
    image: resolveApiUrl('/api/images/song/nadan parinde'),
    song: {
      id: 'nadan-1',
      title: 'Nadaan Parinde',
      artist: 'A.R. Rahman / Mohit Chauhan',
      duration: 385,
      audioUrl: resolveApiUrl('/api/songs/26/stream'),
      artwork: resolveApiUrl('/api/images/song/nadan parinde'),
    },
  },
  {
    id: 'nr-samjhawa',
    title: 'Samjhawa',
    subtitle: 'Arijit Singh / Shreya Ghoshal',
    image: resolveApiUrl('/api/images/song/samjhawa'),
    song: {
      id: 'samjhawa-1',
      title: 'Samjhawa',
      artist: 'Arijit Singh / Shreya Ghoshal',
      duration: 269,
      audioUrl: resolveApiUrl('/api/songs/30/stream'),
      artwork: resolveApiUrl('/api/images/song/samjhawa'),
    },
  },
]

export const RECENTLY_PLAYED = [
  {
    id: 'rp-khat',
    title: 'Khat',
    category: 'Song',
    image: '/api/images/song/khat',
    song: {
      id: 'khat-1',
      title: 'Khat',
      artist: 'Arijit Singh',
      duration: 245,
      audioUrl: '/api/songs/28/stream',
      artwork: '/api/images/song/khat',
    },
  },
  {
    id: 'rp-nadan',
    title: 'Nadaan Parinde',
    category: 'Song',
    image: '/api/images/song/nadan parinde',
    song: {
      id: 'nadan-1',
      title: 'Nadaan Parinde',
      artist: 'A.R. Rahman / Mohit Chauhan',
      duration: 385,
      audioUrl: '/api/songs/26/stream',
      artwork: '/api/images/song/nadan parinde',
    },
  },
  {
    id: 'rp-samjhawa',
    title: 'Samjhawa',
    category: 'Song',
    image: '/api/images/song/samjhawa',
    song: {
      id: 'samjhawa-1',
      title: 'Samjhawa',
      artist: 'Arijit Singh / Shreya Ghoshal',
      duration: 269,
      audioUrl: '/api/songs/30/stream',
      artwork: '/api/images/song/samjhawa',
    },
  },
]

export const CATEGORY_CARDS = [
  {
    id: 'songs',
    badge: 'Song',
    title: 'Songs',
    description: 'Explore trending tracks and hidden gems from every genre.',
    image: '/api/images/home/song cover photo for home',
    navTarget: 'Songs',
  },
  {
    id: 'artists',
    badge: 'Artist',
    title: 'Artists',
    description: 'Discover new artists and follow your favorites.',
    image: '/api/images/home/artist-homepage',
    navTarget: 'Artists',
  },
  {
    id: 'albums',
    badge: 'Album',
    title: 'Albums',
    description: 'Browse full albums and complete discographies.',
    image: '/api/images/home/cover image for home',
    navTarget: 'Albums',
  },
  {
    id: 'playlists',
    badge: 'Playlists',
    title: 'Playlists',
    description: 'Curated collections for every mood and moment.',
    image: '/api/images/home/playlist img for home',
    navTarget: 'Playlists',
  },
]

export const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'New album released',
    message: 'Drake just dropped a new album. Listen now!',
    time: '2 min ago',
  },
  {
    id: 'n2',
    title: 'Playlist updated',
    message: 'Your "Chill Vibes" playlist has 5 new songs.',
    time: '1 hour ago',
  },
  {
    id: 'n3',
    title: 'Concert reminder',
    message: 'Arctic Monkeys live in London — tomorrow at 8 PM.',
    time: '3 hours ago',
  },
]

export const ARTISTS = [
  {
    id: '1',
    name: 'A.R. Rahman',
    image: '/api/images/artist/1',
    rating: 5.0,
    bio: 'Academy Award and Grammy Award-winning Indian composer, record producer, singer and songwriter known for his revolutionary scores.',
    type: 'artist',
  },
  {
    id: '2',
    name: 'Atif Aslam',
    image: '/api/images/artist/2',
    rating: 4.9,
    bio: 'Pakistani singer and songwriter known for his soulful vocals across pop, rock and film music.',
    type: 'artist',
  },
  {
    id: '3',
    name: 'Arijit Singh',
    image: '/api/images/artist/3',
    rating: 4.9,
    bio: 'Indian playback singer and composer known for his emotive vocals across Bollywood, Sufi and contemporary music.',
    type: 'artist',
  },
  {
    id: '4',
    name: 'Ustad Nusrat Fateh Ali Khan',
    image: '/api/images/artist/4',
    rating: 5.0,
    bio: 'Legendary Pakistani Qawwali singer and musician who popularized Sufi devotional music worldwide.',
    type: 'artist',
  },
  {
    id: '5',
    name: 'Anuv Jain',
    image: '/api/images/artist/5',
    rating: 4.8,
    bio: 'Indian indie singer-songwriter celebrated for acoustic melodies, acoustic guitar compositions, and poetic lyrics.',
    type: 'artist',
  },
  {
    id: '6',
    name: 'Javed Ali',
    image: '/api/images/artist/6',
    rating: 4.7,
    bio: 'Indian playback singer renowned for soulful renditions in Hindi, Bengali, and regional cinema soundtracks.',
    type: 'artist',
  },
  {
    id: '7',
    name: 'Mohit Chauhan',
    image: '/api/images/artist/7',
    rating: 4.8,
    bio: 'Indian playback singer known for his work in Hindi cinema and lead vocalist of Silk Route band.',
    type: 'artist',
  },
  {
    id: '8',
    name: 'Mohammed Rafi',
    image: '/api/images/artist/8',
    rating: 5.0,
    bio: 'Legendary Indian playback singer known for his versatility across romantic songs, ghazals, qawwalis and classical music.',
    type: 'artist',
  },
  {
    id: '9',
    name: 'Sonu Nigam',
    image: '/api/images/artist/9',
    rating: 4.9,
    bio: 'Iconic Indian playback singer and composer praised for his wide vocal range and timeless romantic melodies.',
    type: 'artist',
  },
  {
    id: '10',
    name: 'Dua Lipa',
    image: '/api/images/artist/10',
    rating: 4.8,
    bio: 'English singer and songwriter known for pop and dance-pop hits including New Rules and Levitating.',
    type: 'artist',
  },
  {
    id: '11',
    name: 'KK',
    image: '/api/images/artist/11',
    rating: 4.9,
    bio: 'Indian playback singer celebrated for his versatile voice and memorable Hindi film songs.',
    type: 'artist',
  },
  {
    id: '12',
    name: 'Darshan Raval',
    image: '/api/images/artist/12',
    rating: 4.7,
    bio: 'Indian playback singer, composer and songwriter known for hit romantic tracks.',
    type: 'artist',
  },
]

export const ALBUMS = [
  { id: 'al1', title: 'Rockstar', artistId: '1', cover: '/api/images/song/14' },
  { id: 'al2', title: 'Badlapur', artistId: '2', cover: '/api/images/song/12' },
  { id: 'al3', title: 'Aashiqui 2', artistId: '3', cover: '/api/images/song/2' },
  { id: 'al4', title: 'Qawwali Classics', artistId: '4', cover: '/api/images/song/20' },
  { id: 'al5', title: 'Baarishein', artistId: '5', cover: '/api/images/song/8' },
  { id: 'al6', title: 'Ghajini', artistId: '6', cover: '/api/images/song/6' },
]

const assignIds = (song) => {
  const artist = ARTISTS.find(a => song.artist.includes(a.name))
  if (artist) song.artistId = artist.id
  
  // Assign dummy albums based on artist to ensure relations work
  if (song.artist === 'The Weeknd') {
    song.albumId = song.title === 'Starboy' ? 'al2' : 'al1'
  } else if (song.artist === 'Dua Lipa') {
    song.albumId = 'al3'
  } else if (song.artist === 'Arctic Monkeys') {
    song.albumId = 'al4'
  } else if (song.artist === 'Tame Impala') {
    song.albumId = 'al5'
  } else if (song.artist === 'Billie Eilish') {
    song.albumId = 'al6'
  }
  
  return song
}

export const ALL_SONGS = [
  ...FEATURED_SLIDES.map((s) => assignIds({...s.song})),
  ...NEW_RELEASES.map((r) => assignIds({...r.song})),
  ...RECENTLY_PLAYED.map((r) => assignIds({...r.song})),
]

export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const SONG_CATEGORIES = [
  {
    id: 'cat-trending',
    title: 'Trending Now',
    songs: [
      ...FEATURED_SLIDES.map((s) => s.song),
      NEW_RELEASES[0]?.song,
      RECENTLY_PLAYED[0]?.song,
    ].filter(Boolean).slice(0, 6)
  },
  {
    id: 'cat-recent',
    title: 'Recently Played',
    songs: [
      ...RECENTLY_PLAYED.map((r) => r.song)
    ].filter(Boolean)
  },
  {
    id: 'cat-top',
    title: 'Top Rated',
    songs: [
      NEW_RELEASES[1]?.song,
      NEW_RELEASES[2]?.song,
      FEATURED_SLIDES[2]?.song,
      RECENTLY_PLAYED[3]?.song,
      FEATURED_SLIDES[0]?.song,
      RECENTLY_PLAYED[1]?.song,
    ].filter(Boolean)
  },
  {
    id: 'cat-chill',
    title: 'Chill / Relax',
    songs: [
      RECENTLY_PLAYED[4]?.song,
      RECENTLY_PLAYED[2]?.song,
      FEATURED_SLIDES[3]?.song,
      NEW_RELEASES[2]?.song,
      RECENTLY_PLAYED[0]?.song,
    ].filter(Boolean)
  },
  {
    id: 'cat-workout',
    title: 'Workout',
    songs: [
      RECENTLY_PLAYED[3]?.song,
      RECENTLY_PLAYED[1]?.song,
      FEATURED_SLIDES[1]?.song,
      NEW_RELEASES[0]?.song,
      RECENTLY_PLAYED[0]?.song,
    ].filter(Boolean)
  }
]

