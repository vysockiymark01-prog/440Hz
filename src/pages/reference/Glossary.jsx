import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import glossary from '../../data/glossary.js'
import { useFavorites } from '../../hooks/useFavorites.js'

export default function Glossary() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState(null)
  const { isTermFav } = useFavorites()

  const sorted = useMemo(
    () => [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'ru')),
    [],
  )

  const letters = useMemo(
    () => Array.from(new Set(sorted.map((g) => g.term[0].toUpperCase()))),
    [sorted],
  )

  const filtered = sorted.filter((g) => {
    const matchesQuery = query.trim() === '' || g.term.toLowerCase().includes(query.toLowerCase())
    const matchesLetter = !letter || g.term[0].toUpperCase() === letter
    return matchesQuery && matchesLetter
  })

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference')}>‹ Справочник</button>
      <h1 className="screen-title">Глоссарий</h1>
      <input
        type="search"
        placeholder="Поиск термина…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <div className="tag-list" style={{ marginBottom: 14 }}>
        <button
          className={`pill ${!letter ? 'badge-accent' : ''}`}
          onClick={() => setLetter(null)}
        >
          Все
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

      {filtered.length === 0 && <div className="empty-state">Ничего не найдено</div>}

      {filtered.map((g) => (
        <Link key={g.id} to={`/reference/glossary/${g.id}`} className="card-tap row">
          <span>
            <div style={{ fontWeight: 700 }}>{g.term}{isTermFav(g.id) ? ' ★' : ''}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{g.short}</div>
          </span>
          <span>›</span>
        </Link>
      ))}
    </div>
  )
}
