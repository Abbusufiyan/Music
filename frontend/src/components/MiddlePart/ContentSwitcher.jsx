import { useApp } from '../../context/AppContext'

import HomeContent from './HomeContent'
import SongsContent from './SongsContent'
import ArtistsContent from './ArtistsContent'
import AlbumsContent from './AlbumsContent'
import PlaylistsContent from './PlaylistsContent'
import ProfileContent from './ProfileContent'
import SettingsContent from './SettingsContent'
import MoreContent from './MoreContent'

export function ContentSwitcher() {
  const { activeNav } = useApp()

  switch (activeNav) {
    case 'Home':
      return <HomeContent />

    case 'Songs':
      return <SongsContent />

    case 'Artists':
      return <ArtistsContent />

    case 'Albums':
      return <AlbumsContent />

    case 'Playlists':
      return <PlaylistsContent />

    case 'Profile':
      return <ProfileContent />

    case 'Settings':
      return <SettingsContent />

    case 'More':
      return <MoreContent />

    default:
      return <HomeContent />
  }
}