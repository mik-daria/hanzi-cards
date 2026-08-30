export type AppScreen = 'home' | 'add'

export interface WordDraft {
  hanzi: string
  pinyin: string
  translation: string
  emoji: string
}

const draftStorageKey = 'hanzi-cards:word-draft'
const screenStorageKey = 'hanzi-cards:screen'

function isWordDraft(value: unknown): value is WordDraft {
  if (!value || typeof value !== 'object') return false
  const draft = value as Record<string, unknown>
  return typeof draft.hanzi === 'string' && typeof draft.pinyin === 'string' && typeof draft.translation === 'string' && typeof draft.emoji === 'string'
}

function isEmptyDraft(draft: WordDraft): boolean {
  return Object.values(draft).every((value) => value.trim().length === 0)
}

export function loadDraft(): WordDraft | undefined {
  try {
    const rawDraft = localStorage.getItem(draftStorageKey)
    if (!rawDraft) return undefined
    const draft: unknown = JSON.parse(rawDraft)
    return isWordDraft(draft) && !isEmptyDraft(draft) ? draft : undefined
  } catch { return undefined }
}

export function saveDraft(draft: WordDraft): void {
  try {
    if (isEmptyDraft(draft)) localStorage.removeItem(draftStorageKey)
    else localStorage.setItem(draftStorageKey, JSON.stringify(draft))
  } catch { /* Draft persistence is best effort. */ }
}

export function clearDraft(): void {
  try { localStorage.removeItem(draftStorageKey) }
  catch { /* Draft cleanup is best effort. */ }
}

export function loadScreen(): AppScreen {
  try { return localStorage.getItem(screenStorageKey) === 'add' ? 'add' : 'home' }
  catch { return 'home' }
}

export function saveScreen(screen: AppScreen): void {
  try { localStorage.setItem(screenStorageKey, screen) }
  catch { /* Screen persistence is best effort. */ }
}
