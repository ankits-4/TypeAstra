import { readStorage, writeStorage } from './storageClient'

export interface StoredProfile {
  id: string
  username: string
  color: string
  createdAt: string
}

const COLORS = ['#FFB347', '#6BCB77', '#4D96FF', '#FF6B6B', '#C77DFF', '#FFD93D', '#4ECDC4', '#F783AC']

export function loadProfileList(): StoredProfile[] {
  return readStorage<StoredProfile[]>('profileList', [])
}

export function saveProfileList(list: StoredProfile[]) {
  writeStorage('profileList', list)
}

export function loadActiveProfileId(): string | null {
  return readStorage<string | null>('activeProfileId', null)
}

export function setActiveProfileId(id: string | null) {
  writeStorage('activeProfileId', id)
}

export function createProfile(username: string): StoredProfile {
  const list = loadProfileList()
  const profile: StoredProfile = {
    id: Math.random().toString(36).slice(2, 10),
    username: username.trim().slice(0, 24),
    color: COLORS[list.length % COLORS.length],
    createdAt: new Date().toISOString(),
  }
  saveProfileList([...list, profile])
  return profile
}

export function deleteProfile(id: string) {
  saveProfileList(loadProfileList().filter((p) => p.id !== id))
}

export function renameProfile(id: string, username: string) {
  const list = loadProfileList()
  const next = list.map((p) => (p.id === id ? { ...p, username: username.trim().slice(0, 24) } : p))
  saveProfileList(next)
}
