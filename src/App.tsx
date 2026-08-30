import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import './App.css'
import { translations, type Language } from './data/translations'
import { demoWords } from './data/words'
import { clearDraft, loadDraft, loadScreen, saveDraft, saveScreen, type AppScreen } from './storage/draftStorage'
import { deleteImage, draftImageId, getImage, saveImage } from './storage/imageStorage'
import { loadWords, saveWords, type StoredWord } from './storage/wordStorage'
import { compressImage } from './utils/imageCompression'

const languages: Language[] = ['ru', 'en', 'de']

function BookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z"/></svg>
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"/></svg>
}

function useObjectUrl(blob?: Blob) {
  const url = useMemo(() => blob ? URL.createObjectURL(blob) : '', [blob])
  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [url])
  return url
}

function StoredImage({ imageId, alt }: { imageId: string; alt: string }) {
  const [blob, setBlob] = useState<Blob>()
  const url = useObjectUrl(blob)
  useEffect(() => {
    let active = true
    getImage(imageId).then((image) => { if (active) setBlob(image) }).catch(() => { if (active) setBlob(undefined) })
    return () => { active = false }
  }, [imageId])
  return url ? <img className="word-card__image" src={url} alt={alt} loading="lazy"/> : null
}

interface WordCardProps { hanzi: string; pinyin: string; translation: string; emoji?: string; imageId?: string }

function WordCard({ hanzi, pinyin, translation, emoji, imageId }: WordCardProps) {
  return <article className={`word-card${imageId || emoji ? ' word-card--with-media' : ''}`}>
    <div className="word-card__media">{imageId ? <StoredImage imageId={imageId} alt=""/> : emoji ? <span className="word-card__emoji" aria-hidden="true">{emoji}</span> : null}</div>
    <div className="word-card__content"><p className="word-card__hanzi" lang="zh">{hanzi}</p><p className="word-card__pinyin">{pinyin}</p><p className="word-card__translation">{translation}</p></div>
  </article>
}

type SaveResult = 'success' | 'image-error' | 'word-error'
interface AddWordFormProps { language: Language; onBack: () => void; onCancel: () => void; onSave: (word: StoredWord, image?: Blob) => Promise<SaveResult> }

function AddWordForm({ language, onBack, onCancel, onSave }: AddWordFormProps) {
  const copy = translations[language]
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageChangedRef = useRef(false)
  const [values, setValues] = useState(() => loadDraft() ?? { hanzi: '', pinyin: '', translation: '', emoji: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [image, setImage] = useState<Blob>()
  const [imageError, setImageError] = useState('')
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const previewUrl = useObjectUrl(image)

  useEffect(() => { saveDraft(values) }, [values])

  useEffect(() => {
    let active = true
    getImage(draftImageId)
      .then((storedImage) => { if (active && !imageChangedRef.current) setImage(storedImage) })
      .catch(() => { /* A missing draft image does not block the form. */ })
    return () => { active = false }
  }, [])

  function updateField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImageError('')
    setIsProcessingImage(true)
    try {
      const compressedImage = await compressImage(file)
      try { await saveImage(draftImageId, compressedImage) }
      catch {
        setImageError(copy.photoStorageError)
        return
      }
      imageChangedRef.current = true
      setImage(compressedImage)
    } catch { setImageError(copy.photoReadError) }
    finally { setIsProcessingImage(false) }
  }

  async function removeSelectedImage() {
    imageChangedRef.current = true
    setImage(undefined)
    setImageError('')
    setIsProcessingImage(true)
    try { await deleteImage(draftImageId) }
    catch { setImageError(copy.photoStorageError) }
    finally { setIsProcessingImage(false) }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isProcessingImage || isSaving) return
    const trimmed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])) as typeof values
    const nextErrors: Record<string, string> = {}
    for (const field of ['hanzi', 'pinyin', 'translation'] as const) if (!trimmed[field]) nextErrors[field] = copy.requiredError
    setValues(trimmed)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSaving(true)
    setImageError('')
    const result = await onSave({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, hanzi: trimmed.hanzi, pinyin: trimmed.pinyin, emoji: trimmed.emoji, translation: trimmed.translation, translationLanguage: language }, image)
    if (result === 'image-error') setImageError(copy.photoStorageError)
    if (result === 'word-error') setImageError(copy.storageError)
    setIsSaving(false)
  }

  return <main className="form-page">
    <button className="back-button" type="button" onClick={onBack}><span aria-hidden="true">←</span>{copy.back}</button>
    <section className="form-intro"><p className="section-heading__kicker">{copy.newCard}</p><h1>{copy.formTitle}</h1><p>{copy.formSubtitle}</p></section>
    <form className="word-form" onSubmit={handleSubmit} noValidate>
      <label className="form-field"><span>{copy.hanziLabel}<b aria-hidden="true">*</b></span><input lang="zh" value={values.hanzi} onChange={(event) => updateField('hanzi', event.target.value)} placeholder={copy.hanziPlaceholder} aria-invalid={Boolean(errors.hanzi)} aria-describedby={errors.hanzi ? 'hanzi-error' : undefined}/>{errors.hanzi && <small id="hanzi-error" className="field-error">{errors.hanzi}</small>}</label>
      <label className="form-field"><span>{copy.pinyinLabel}<b aria-hidden="true">*</b></span><input value={values.pinyin} onChange={(event) => updateField('pinyin', event.target.value)} placeholder={copy.pinyinPlaceholder} aria-invalid={Boolean(errors.pinyin)} aria-describedby={errors.pinyin ? 'pinyin-error' : undefined}/>{errors.pinyin && <small id="pinyin-error" className="field-error">{errors.pinyin}</small>}</label>
      <label className="form-field"><span>{copy.translationLabel} ({language.toUpperCase()})<b aria-hidden="true">*</b></span><input value={values.translation} onChange={(event) => updateField('translation', event.target.value)} placeholder={copy.translationPlaceholder} aria-invalid={Boolean(errors.translation)} aria-describedby={errors.translation ? 'translation-error' : undefined}/>{errors.translation && <small id="translation-error" className="field-error">{errors.translation}</small>}</label>
      <label className="form-field"><span>{copy.emojiLabel}<em>{copy.optional}</em></span><input value={values.emoji} onChange={(event) => updateField('emoji', event.target.value)} placeholder={copy.emojiPlaceholder}/></label>
      <div className="photo-field"><div className="photo-field__label"><span>{copy.photoLabel}</span><em>{copy.optional}</em></div><input ref={fileInputRef} className="visually-hidden" type="file" accept="image/*" onChange={handleImageChange}/>
        {previewUrl ? <div className="photo-preview"><img src={previewUrl} alt={copy.photoPreviewAlt}/><div className="photo-preview__actions"><button type="button" onClick={() => fileInputRef.current?.click()}>{copy.replacePhoto}</button><button className="remove-photo" type="button" onClick={removeSelectedImage}>{copy.removePhoto}</button></div></div> : <button className="photo-picker" type="button" disabled={isProcessingImage} onClick={() => fileInputRef.current?.click()}><span aria-hidden="true">📷</span><span><strong>{isProcessingImage ? copy.photoLoading : copy.choosePhoto}</strong><small>{copy.photoHint}</small></span></button>}
        {imageError && <small className="field-error" role="alert">{imageError}</small>}
      </div>
      <div className="form-actions"><button className="button button--primary" type="submit" disabled={isSaving || isProcessingImage}>{copy.saveWord}</button><button className="button button--secondary" type="button" onClick={onCancel}>{copy.cancel}</button></div>
    </form>
  </main>
}

function App() {
  const [language, setLanguage] = useState<Language>('ru')
  const [screen, setScreen] = useState<AppScreen>(loadScreen)
  const [storedWords, setStoredWords] = useState<StoredWord[]>(loadWords)
  const copy = translations[language]
  const totalWords = demoWords.length + storedWords.length

  function navigateTo(nextScreen: AppScreen) {
    saveScreen(nextScreen)
    setScreen(nextScreen)
  }

  async function cancelDraft() {
    clearDraft()
    try { await deleteImage(draftImageId) }
    catch { /* Draft cleanup is best effort. */ }
    navigateTo('home')
  }

  async function addWord(word: StoredWord, image?: Blob): Promise<SaveResult> {
    let imageId: string | undefined
    if (image) {
      imageId = `image-${word.id}`
      try { await saveImage(imageId, image) }
      catch { return 'image-error' }
    }
    const wordWithImage = imageId ? { ...word, imageId } : word
    const nextWords = [...storedWords, wordWithImage]
    if (!saveWords(nextWords)) {
      if (imageId) { try { await deleteImage(imageId) } catch { /* Orphan cleanup is best effort. */ } }
      return 'word-error'
    }
    setStoredWords(nextWords)
    clearDraft()
    try { await deleteImage(draftImageId) }
    catch { /* The saved card no longer depends on the draft image. */ }
    navigateTo('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return 'success'
  }

  return <div className="app-shell">
    <header className="app-header"><button className="brand" type="button" onClick={() => navigateTo('home')} aria-label="Hanzi Cards"><span className="brand__mark" lang="zh">字</span><span className="brand__name">Hanzi Cards</span></button><div className="language-switcher" aria-label={copy.languageLabel}>{languages.map((item) => <button className={item === language ? 'is-active' : ''} key={item} type="button" aria-pressed={item === language} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</div></header>
    {screen === 'add' ? <AddWordForm language={language} onBack={() => navigateTo('home')} onCancel={cancelDraft} onSave={addWord}/> : <main id="top">
      <section className="hero-section"><div className="eyebrow"><span className="eyebrow__dot" />{copy.eyebrow}</div><h1>{copy.greeting}</h1><p className="hero-section__subtitle">{copy.subtitle}</p><div className="dictionary-count"><span className="dictionary-count__icon"><BookIcon /></span><span><strong>{totalWords}</strong>{copy.wordsCount}</span></div><div className="actions"><button className="button button--primary" type="button">{copy.review}<ArrowIcon /></button><button className="button button--secondary" type="button" onClick={() => navigateTo('add')}><span aria-hidden="true">＋</span>{copy.addWord}</button></div></section>
      <section className="words-section" aria-labelledby="words-heading"><div className="section-heading"><div><p className="section-heading__kicker">{copy.collection}</p><h2 id="words-heading">{copy.recentWords}</h2></div><span className="section-heading__count">{totalWords}</span></div><div className="word-grid">{demoWords.map((word) => <WordCard key={word.hanzi} {...word} translation={word.translations[language]}/>)}{storedWords.map((word) => <WordCard key={word.id} {...word} translation={word.translation}/>)}</div></section>
    </main>}
    <footer><span lang="zh">每天进步一点点</span><span>{copy.footer}</span></footer>
  </div>
}

export default App
