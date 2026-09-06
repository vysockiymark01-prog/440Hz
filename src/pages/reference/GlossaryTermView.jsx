import { useParams, useNavigate, Link } from 'react-router-dom'
import glossary from '../../data/glossary.js'
import lectures from '../../data/lectures.js'
import { useFavorites } from '../../hooks/useFavorites.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function GlossaryTermView() {
  const { termId } = useParams()
  const navigate = useNavigate()
  const term = glossary.find((g) => g.id === termId)
  const { isTermFav, toggleTerm } = useFavorites()
  const { t, tr } = useLanguage()

  if (!term) {
    return <div className="empty-state">{t('glt_not_found')}</div>
  }

  const lecture = lectures.find((l) => l.num === term.lecture)
  const fav = isTermFav(term.id)

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference/glossary')}>‹ {t('gl_title')}</button>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <h1 className="screen-title" style={{ flex: 1 }}>{tr(term.term)}</h1>
        <button className={`star-btn ${fav ? 'active' : ''}`} onClick={() => toggleTerm(term.id)}>
          {fav ? '★' : '☆'}
        </button>
      </div>
      <p>{tr(term.definition)}</p>
      {lecture && (
        <Link to={`/reference/${lecture.id}`} className="pill badge-accent" style={{ display: 'inline-block' }}>
          {t('glt_lecture_prefix', { num: lecture.num, title: lecture.title })}
        </Link>
      )}
    </div>
  )
}
