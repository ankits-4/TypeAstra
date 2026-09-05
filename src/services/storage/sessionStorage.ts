import { TypingResult } from '../../types'
import { readStorage, writeStorage } from './storageClient'

const MAX_STORED_RESULTS = 500

export function loadResults(profileId: string): TypingResult[] {
  return readStorage<TypingResult[]>(`${profileId}:results`, [])
}

export function appendResult(profileId: string, result: TypingResult) {
  const results = loadResults(profileId)
  results.push(result)
  if (results.length > MAX_STORED_RESULTS) results.splice(0, results.length - MAX_STORED_RESULTS)
  writeStorage(`${profileId}:results`, results)
  return results
}
