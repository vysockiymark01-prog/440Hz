import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import lectures from '../../data/lectures.js'
import glossary from '../../data/glossary.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

function buildIndex(glossaryLabel, tr) {
  const items = []
  for (const lecture of lectures) {
    for (const article of lecture.articles) {
      items.push({
        type: 'article',
        id: `${lecture.id}/${article.id}`,
        title: tr(article.title),
        text: tr(article.body),
        lectureTitle: tr(lecture.title),
        to: `/reference/${lecture.id}/${article.id}`,
      })
    }
  }
  for (const term of glossary) {
    items.push({
      type: 'term',
      id: term.id,
      title: tr(term.term),
      text: tr(term.definition),
      lectureTitle: glossaryLabel,
      to: `/reference/glossary/${term.id}`,
    })
  }
  return items
}

export default function SearchScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { t, tr } = useLanguage()

  const fuse = useMemo(() => {
    const searchIndex = buildIndex(t('srch_glossary_label'), tr)
    return new Fuse(searchIndex, {
      keys: [
        { name: 'title', weight: 0.6 },
        { name: 'text', weight: 0.4 },
      ],
      threshold: 0.32,
      ignoreLocation: true,
      minMatchCharLength: 2,
    })
  }, [t, tr])

  const results = useMemo(() => {
    if (query.trim().length < 2) return []
    return fuse.search(query).slice(0, 30).map((r) => r.item)
  }, [query, fuse])

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference')}>‹ {t('back_reference')}</button>
      <h1 className="screen-title">{t('srch_title')}</h1>
      <input
        type="search"
        autoFocus
        placeholder={t('srch_placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 14 }}
      />

      {query.trim().length >= 2 && results.length === 0 && (
        <div className="empty-state">{t('srch_empty')}</div>
      )}

      {results.map((r) => (
        <Link key={r.type + r.id} to={r.to} className="card-tap row">
          <span>
            <div style={{ fontWeight: 700 }}>{r.title}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{r.lectureTitle}</div>
          </span>
          <span>›</span>
        </Link>
      ))}
    </div>
  )
}
