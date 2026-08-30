import { useState, type FormEvent } from 'react'
import './App.css'
import { translations, type Language } from './data/translations'
import { demoWords } from './data/words'
import { loadWords, saveWords, type StoredWord } from './storage/wordStorage'

const languages: Language[] = ['ru', 'en', 'de']

function BookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z"/></svg>
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"/></svg>
}

interface WordCardProps { hanzi: string; pinyin: string; translation: string; emoji?: string }

function WordCard({ hanzi, pinyin, translation, emoji }: WordCardProps) {
  return <article className="word-card">{emoji && <span className="word-card__emoji" aria-hidden="true">{emoji}</span>}<div className="word-card__content"><p className="word-card__hanzi" lang="zh">{hanzi}</p><p className="word-card__pinyin">{pinyin}</p><p className="word-card__translation">{translation}</p></div></article>
}

interface AddWordFormProps { language: Language; onCancel: () => void; onSave: (word: StoredWord) => boolean }

function AddWordForm({ language, onCancel, onSave }: AddWordFormProps) {
  const copy = translations[language]
  const [values, setValues] = useState({ hanzi: '', pinyin: '', translation: '', emoji: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [storageError, setStorageError] = useState('')

  function updateField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setStorageError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])) as typeof values
    const nextErrors: Record<string, string> = {}
    for (const field of ['hanzi', 'pinyin', 'translation'] as const) if (!trimmed[field]) nextErrors[field] = copy.requiredError
    setValues(trimmed)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    const word: StoredWord = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, hanzi: trimmed.hanzi, pinyin: trimmed.pinyin, emoji: trimmed.emoji, translation: trimmed.translation, translationLanguage: language }
    if (!onSave(word)) setStorageError(copy.storageError)
  }

  return <main className="form-page">
    <button className="back-button" type="button" onClick={onCancel}><span aria-hidden="true">←</span>{copy.back}</button>
    <section className="form-intro"><p className="section-heading__kicker">{copy.newCard}</p><h1>{copy.formTitle}</h1><p>{copy.formSubtitle}</p></section>
    <form className="word-form" onSubmit={handleSubmit} noValidate>
      <label className="form-field"><span>{copy.hanziLabel}<b aria-hidden="true">*</b></span><input lang="zh" value={values.hanzi} onChange={(event) => updateField('hanzi', event.target.value)} placeholder={copy.hanziPlaceholder} aria-invalid={Boolean(errors.hanzi)} aria-describedby={errors.hanzi ? 'hanzi-error' : undefined}/>{errors.hanzi && <small id="hanzi-error" className="field-error">{errors.hanzi}</small>}</label>
      <label className="form-field"><span>{copy.pinyinLabel}<b aria-hidden="true">*</b></span><input value={values.pinyin} onChange={(event) => updateField('pinyin', event.target.value)} placeholder={copy.pinyinPlaceholder} aria-invalid={Boolean(errors.pinyin)} aria-describedby={errors.pinyin ? 'pinyin-error' : undefined}/>{errors.pinyin && <small id="pinyin-error" className="field-error">{errors.pinyin}</small>}</label>
      <label className="form-field"><span>{copy.translationLabel} ({language.toUpperCase()})<b aria-hidden="true">*</b></span><input value={values.translation} onChange={(event) => updateField('translation', event.target.value)} placeholder={copy.translationPlaceholder} aria-invalid={Boolean(errors.translation)} aria-describedby={errors.translation ? 'translation-error' : undefined}/>{errors.translation && <small id="translation-error" className="field-error">{errors.translation}</small>}</label>
      <label className="form-field"><span>{copy.emojiLabel}<em>{copy.optional}</em></span><input value={values.emoji} onChange={(event) => updateField('emoji', event.target.value)} placeholder={copy.emojiPlaceholder}/></label>
      {storageError && <p className="form-error" role="alert">{storageError}</p>}
      <div className="form-actions"><button className="button button--primary" type="submit">{copy.saveWord}</button><button className="button button--secondary" type="button" onClick={onCancel}>{copy.cancel}</button></div>
    </form>
  </main>
}

function App() {
  const [language, setLanguage] = useState<Language>('ru')
  const [screen, setScreen] = useState<'home' | 'add'>('home')
  const [storedWords, setStoredWords] = useState<StoredWord[]>(loadWords)
  const copy = translations[language]
  const totalWords = demoWords.length + storedWords.length

  function addWord(word: StoredWord) {
    const nextWords = [...storedWords, word]
    if (!saveWords(nextWords)) return false
    setStoredWords(nextWords)
    setScreen('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return true
  }

  return <div className="app-shell">
    <header className="app-header"><button className="brand" type="button" onClick={() => setScreen('home')} aria-label="Hanzi Cards"><span className="brand__mark" lang="zh">字</span><span className="brand__name">Hanzi Cards</span></button><div className="language-switcher" aria-label={copy.languageLabel}>{languages.map((item) => <button className={item === language ? 'is-active' : ''} key={item} type="button" aria-pressed={item === language} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</div></header>
    {screen === 'add' ? <AddWordForm language={language} onCancel={() => setScreen('home')} onSave={addWord}/> : <main id="top">
      <section className="hero-section"><div className="eyebrow"><span className="eyebrow__dot" />{copy.eyebrow}</div><h1>{copy.greeting}</h1><p className="hero-section__subtitle">{copy.subtitle}</p><div className="dictionary-count"><span className="dictionary-count__icon"><BookIcon /></span><span><strong>{totalWords}</strong>{copy.wordsCount}</span></div><div className="actions"><button className="button button--primary" type="button">{copy.review}<ArrowIcon /></button><button className="button button--secondary" type="button" onClick={() => setScreen('add')}><span aria-hidden="true">＋</span>{copy.addWord}</button></div></section>
      <section className="words-section" aria-labelledby="words-heading"><div className="section-heading"><div><p className="section-heading__kicker">{copy.collection}</p><h2 id="words-heading">{copy.recentWords}</h2></div><span className="section-heading__count">{totalWords}</span></div><div className="word-grid">{demoWords.map((word) => <WordCard key={word.hanzi} {...word} translation={word.translations[language]}/>)}{storedWords.map((word) => <WordCard key={word.id} {...word} translation={word.translation}/>)}</div></section>
    </main>}
    <footer><span lang="zh">每天进步一点点</span><span>{copy.footer}</span></footer>
  </div>
}

export default App
