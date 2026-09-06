import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import glossary from '../../data/glossary.js'
import { useFavorites } from '../../hooks/useFavorites.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function Glossary() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState(null)
  const { isTermFav } = useFavorites()
  const { lang, t, tr } = useLanguage()

  const sorted = useMemo(
    () => [...glossary].sort((a, b) => tr(a.term).localeCompare(tr(b.term), lang)),
    [lang, tr],
  )

  const letters = useMemo(
    () => Array.from(new Set(sorted.map((g) => tr(g.term)[0].toUpperCase()))),
    [sorted, tr],
  )

  const filtered = sorted.filter((g) => {
    const term = tr(g.term)
    const matchesQuery = query.trim() === '' || term.toLowerCase().includes(query.toLowerCase())
    const matchesLetter = !letter || term[0].toUpperCase() === letter
    return matchesQuery && matchesLetter
  })

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference')}>‹ {t('back_reference')}</button>
      <h1 className="screen-title">{t('gl_title')}</h1>
      <input
        type="search"
        placeholder={t('gl_search_placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <div className="tag-list" style={{ marginBottom: 14 }}>
        <button
          className={`pill ${!letter ? 'badge-accent' : ''}`}
          onClick={() => setLetter(null)}
        >
          {t('gl_letter_all')}
        </button>
        {letters.map((l) => (
          <button
            key={l}
            className={`pill ${letter === l ? 'badge-accent' : ''}`}
            onClick={() => setLetter(l === letter ? null : l)}
          >
            {l}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty-state">{t('gl_empty')}</div>}

      {filtered.map((g) => (
        <Link key={g.id} to={`/reference/glossary/${g.id}`} className="card-tap row">
          <span>
            <div style={{ fontWeight: 700 }}>{tr(g.term)}{isTermFav(g.id) ? ' ★' : ''}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{tr(g.short)}</div>
          </span>
          <span>›</span>
        </Link>
      ))}
    </div>
  )
}
