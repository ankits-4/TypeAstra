import { UserSettings } from '../../types'
import { readStorage, writeStorage } from './storageClient'

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  showKeyboard: true,
  smoothCaret: true,
  soundEnabled: true,
  reducedMotion: false,
}

export function loadSettings(): UserSettings {
  return { ...DEFAULT_SETTINGS, ...readStorage('settings', DEFAULT_SETTINGS) }
}
export function saveSettings(settings: UserSettings) {
  writeStorage('settings', settings)
}
