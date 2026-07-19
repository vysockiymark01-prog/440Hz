import { useParams, useNavigate, Link } from 'react-router-dom'
import glossary from '../../data/glossary.js'
import lectures from '../../data/lectures.js'
import { useFavorites } from '../../hooks/useFavorites.js'

export default function GlossaryTermView() {
  const { termId } = useParams()
  const navigate = useNavigate()
  const term = glossary.find((g) => g.id === termId)
  const { isTermFav, toggleTerm } = useFavorites()

  if (!term) {
    return <div className="empty-state">Термин не найден.</div>
  }

  const lecture = lectures.find((l) => l.num === term.lecture)
  const fav = isTermFav(term.id)

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference/glossary')}>‹ Глоссарий</button>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <h1 className="screen-title" style={{ flex: 1 }}>{term.term}</h1>
        <button className={`star-btn ${fav ? 'active' : ''}`} onClick={() => toggleTerm(term.id)}>
          {fav ? '★' : '☆'}
        </button>
      </div>
      <p>{term.definition}</p>
      {lecture && (
        <Link to={`/reference/${lecture.id}`} className="pill badge-accent" style={{ display: 'inline-block' }}>
          Лекция {lecture.num} · {lecture.title}
        </Link>
      )}
    </div>
  )
}
