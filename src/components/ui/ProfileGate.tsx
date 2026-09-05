import { useProfiles } from '../../context/ProfileContext'
import { AppDataProvider } from '../../context/AppDataContext'
import ProfilePicker from './ProfilePicker'

export default function ProfileGate({ children }: { children: React.ReactNode }) {
  const { profiles, activeProfileId } = useProfiles()

  const activeProfile = profiles.find((p) => p.id === activeProfileId)

  if (!activeProfile) {
    return <ProfilePicker />
  }

  return (
    <AppDataProvider key={activeProfile.id} profileId={activeProfile.id} defaultUsername={activeProfile.username}>
      {children}
    </AppDataProvider>
  )
}
