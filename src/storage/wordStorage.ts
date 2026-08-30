import type { Language } from '../data/translations'

const storageKey = 'hanzi-cards:words'
const supportedLanguages: Language[] = ['ru', 'en', 'de']

export interface StoredWord { id: string; hanzi: string; pinyin: string; emoji: string; translation: string; translationLanguage: Language }

function isStoredWord(value: unknown): value is StoredWord {
  if (!value || typeof value !== 'object') return false
  const word = value as Record<string, unknown>
  return typeof word.id === 'string' && typeof word.hanzi === 'string' && word.hanzi.trim().length > 0 && typeof word.pinyin === 'string' && word.pinyin.trim().length > 0 && typeof word.emoji === 'string' && typeof word.translation === 'string' && word.translation.trim().length > 0 && supportedLanguages.includes(word.translationLanguage as Language)
}

export function loadWords(): StoredWord[] {
  try {
    const rawWords = localStorage.getItem(storageKey)
    if (!rawWords) return []
    const parsedWords: unknown = JSON.parse(rawWords)
    return Array.isArray(parsedWords) ? parsedWords.filter(isStoredWord) : []
  } catch { return [] }
}

export function saveWords(words: StoredWord[]): boolean {
  try {
    localStorage.setItem(storageKey, JSON.stringify(words))
    return true
  } catch { return false }
}
