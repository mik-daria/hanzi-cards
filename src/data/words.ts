import type { Language } from './translations'

export interface Word { hanzi: string; pinyin: string; emoji: string; translations: Record<Language, string> }

export const words: Word[] = [
  { hanzi: '你好', pinyin: 'nǐ hǎo', emoji: '👋', translations: { ru: 'привет', en: 'hello', de: 'hallo' } },
  { hanzi: '谢谢', pinyin: 'xièxie', emoji: '🙏', translations: { ru: 'спасибо', en: 'thank you', de: 'danke' } },
]
