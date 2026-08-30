import { useState } from 'react'
import './App.css'
import { translations, type Language } from './data/translations'
import { words } from './data/words'

const languages: Language[] = ['ru', 'en', 'de']

function BookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z"/></svg>
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"/></svg>
}

interface WordCardProps { hanzi: string; pinyin: string; translation: string; emoji: string }

function WordCard({ hanzi, pinyin, translation, emoji }: WordCardProps) {
  return <article className="word-card"><span className="word-card__emoji" aria-hidden="true">{emoji}</span><div className="word-card__content"><p className="word-card__hanzi" lang="zh">{hanzi}</p><p className="word-card__pinyin">{pinyin}</p><p className="word-card__translation">{translation}</p></div></article>
}

function App() {
  const [language, setLanguage] = useState<Language>('ru')
  const copy = translations[language]

  return <div className="app-shell">
    <header className="app-header">
      <a className="brand" href="#top" aria-label="Hanzi Cards"><span className="brand__mark" lang="zh">字</span><span className="brand__name">Hanzi Cards</span></a>
      <div className="language-switcher" aria-label={copy.languageLabel}>{languages.map((item) => <button className={item === language ? 'is-active' : ''} key={item} type="button" aria-pressed={item === language} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</div>
    </header>
    <main id="top">
      <section className="hero-section">
        <div className="eyebrow"><span className="eyebrow__dot" />{copy.eyebrow}</div>
        <h1>{copy.greeting}</h1><p className="hero-section__subtitle">{copy.subtitle}</p>
        <div className="dictionary-count"><span className="dictionary-count__icon"><BookIcon /></span><span><strong>{words.length}</strong>{copy.wordsCount}</span></div>
        <div className="actions"><button className="button button--primary" type="button">{copy.review}<ArrowIcon /></button><button className="button button--secondary" type="button"><span aria-hidden="true">＋</span>{copy.addWord}</button></div>
      </section>
      <section className="words-section" aria-labelledby="words-heading">
        <div className="section-heading"><div><p className="section-heading__kicker">{copy.collection}</p><h2 id="words-heading">{copy.recentWords}</h2></div><span className="section-heading__count">{words.length}</span></div>
        <div className="word-grid">{words.map((word) => <WordCard key={word.hanzi} hanzi={word.hanzi} pinyin={word.pinyin} translation={word.translations[language]} emoji={word.emoji} />)}</div>
      </section>
    </main>
    <footer><span lang="zh">每天进步一点点</span><span>{copy.footer}</span></footer>
  </div>
}

export default App
