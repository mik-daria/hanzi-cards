export type Language = 'ru' | 'en' | 'de'

interface InterfaceTranslation { greeting: string; subtitle: string; eyebrow: string; wordsCount: string; review: string; addWord: string; collection: string; recentWords: string; languageLabel: string; footer: string }

export const translations: Record<Language, InterfaceTranslation> = {
  ru: { greeting: 'Учите китайский\nв своём ритме', subtitle: 'Небольшая коллекция слов, к которой приятно возвращаться каждый день.', eyebrow: 'Ваша ежедневная практика', wordsCount: 'слова в словаре', review: 'Повторить', addWord: 'Добавить слово', collection: 'Ваша коллекция', recentWords: 'Недавние слова', languageLabel: 'Язык интерфейса', footer: 'Немного лучше каждый день' },
  en: { greeting: 'Learn Chinese\nat your own pace', subtitle: 'A small collection of words you will enjoy coming back to every day.', eyebrow: 'Your daily practice', wordsCount: 'words in your dictionary', review: 'Review', addWord: 'Add word', collection: 'Your collection', recentWords: 'Recent words', languageLabel: 'Interface language', footer: 'A little better every day' },
  de: { greeting: 'Chinesisch lernen\nin deinem Tempo', subtitle: 'Eine kleine Wortsammlung, zu der du jeden Tag gerne zurückkehrst.', eyebrow: 'Deine tägliche Übung', wordsCount: 'Wörter im Wörterbuch', review: 'Wiederholen', addWord: 'Wort hinzufügen', collection: 'Deine Sammlung', recentWords: 'Neue Wörter', languageLabel: 'Sprache der Benutzeroberfläche', footer: 'Jeden Tag ein bisschen besser' },
}
