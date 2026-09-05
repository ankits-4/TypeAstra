import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  StoredProfile, loadProfileList, loadActiveProfileId, setActiveProfileId as persistActiveId,
  createProfile as createProfileInStorage, deleteProfile as deleteProfileInStorage,
  renameProfile as renameProfileInStorage, saveProfileList,
} from '../services/storage/profileManager'

interface ProfileContextValue {
  profiles: StoredProfile[]
  activeProfileId: string | null
  switchTo: (id: string) => void
  addProfile: (username: string) => void
  removeProfile: (id: string) => void
  renameActiveProfile: (username: string) => void
  activateAccountProfile: (id: string, username: string) => void
  logOut: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<StoredProfile[]>(() => loadProfileList())
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => loadActiveProfileId())

  const switchTo = useCallback((id: string) => {
    persistActiveId(id)
    setActiveProfileId(id)
  }, [])

  const addProfile = useCallback((username: string) => {
    if (!username.trim()) return
    const profile = createProfileInStorage(username)
    setProfiles((prev) => [...prev, profile])
    persistActiveId(profile.id)
    setActiveProfileId(profile.id)
  }, [])

  const removeProfile = useCallback((id: string) => {
    deleteProfileInStorage(id)
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    setActiveProfileId((current) => {
      if (current !== id) return current
      persistActiveId(null)
      return null
    })
  }, [])

  const logOut = useCallback(() => {
    persistActiveId(null)
    setActiveProfileId(null)
  }, [])

  const renameActiveProfile = useCallback((username: string) => {
    if (!activeProfileId || !username.trim()) return
    renameProfileInStorage(activeProfileId, username)
    setProfiles((prev) => prev.map((p) => (p.id === activeProfileId ? { ...p, username: username.trim().slice(0, 24) } : p)))
  }, [activeProfileId])

  const activateAccountProfile = useCallback((id: string, username: string) => {
    setProfiles((current) => {
      if (current.some((profile) => profile.id === id)) return current
      const next = [...current, { id, username: username.slice(0, 24), color: '#A99BFF', createdAt: new Date().toISOString() }]
      saveProfileList(next)
      return next
    })
    persistActiveId(id)
    setActiveProfileId(id)
  }, [])

  return (
    <ProfileContext.Provider value={{ profiles, activeProfileId, switchTo, addProfile, removeProfile, renameActiveProfile, activateAccountProfile, logOut }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfiles() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfiles must be used within ProfileProvider')
  return ctx
}
