import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import lectures from '../../data/lectures.js'
import glossary from '../../data/glossary.js'

function buildIndex() {
  const items = []
  for (const lecture of lectures) {
    for (const article of lecture.articles) {
      items.push({
        type: 'article',
        id: `${lecture.id}/${article.id}`,
        title: article.title,
        text: article.body,
        lectureTitle: lecture.title,
        to: `/reference/${lecture.id}/${article.id}`,
      })
    }
  }
  for (const term of glossary) {
    items.push({
      type: 'term',
      id: term.id,
      title: term.term,
      text: term.definition,
      lectureTitle: 'Глоссарий',
      to: `/reference/glossary/${term.id}`,
    })
  }
  return items
}

const searchIndex = buildIndex()
const fuse = new Fuse(searchIndex, {
  keys: [
    { name: 'title', weight: 0.6 },
    { name: 'text', weight: 0.4 },
  ],
  threshold: 0.32,
  ignoreLocation: true,
  minMatchCharLength: 2,
})

export default function SearchScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (query.trim().length < 2) return []
    return fuse.search(query).slice(0, 30).map((r) => r.item)
  }, [query])

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference')}>‹ Справочник</button>
      <h1 className="screen-title">Поиск</h1>
      <input
        type="search"
        autoFocus
        placeholder="Например: биения, вирбельбанк, штейнунг…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 14 }}
      />

      {query.trim().length >= 2 && results.length === 0 && (
        <div className="empty-state">Ничего не найдено</div>
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
