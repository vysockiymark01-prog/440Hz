import { useParams, useNavigate, Link } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import { useFavorites } from '../../hooks/useFavorites.js'

export default function LectureView() {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const lecture = lectures.find((l) => l.id === lectureId)
  const { isArticleFav, toggleArticle } = useFavorites()

  if (!lecture) {
    return (
      <div className="empty-state">Раздел не найден.</div>
    )
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference')}>‹ Справочник</button>
      <h1 className="screen-title">Лекция {lecture.num}. {lecture.title}</h1>

      {lecture.articles.map((a) => (
        <div key={a.id} className="card-tap row" style={{ padding: 0 }}>
          <Link to={`/reference/${lecture.id}/${a.id}`} style={{ flex: 1, padding: '14px 0 14px 16px', color: 'inherit' }}>
            {a.title}
          </Link>
          <button
            className={`star-btn ${isArticleFav(lecture.id, a.id) ? 'active' : ''}`}
            style={{ padding: '14px 16px' }}
            onClick={(e) => { e.preventDefault(); toggleArticle(lecture.id, a.id) }}
            aria-label="В избранное"
          >
            {isArticleFav(lecture.id, a.id) ? '★' : '☆'}
          </button>
        </div>
      ))}
    </div>
  )
}
