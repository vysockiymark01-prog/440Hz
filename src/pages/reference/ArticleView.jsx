import { useParams, useNavigate } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import TermText from '../../components/TermText.jsx'
import { useFavorites } from '../../hooks/useFavorites.js'

export default function ArticleView() {
  const { lectureId, articleId } = useParams()
  const navigate = useNavigate()
  const lecture = lectures.find((l) => l.id === lectureId)
  const article = lecture?.articles.find((a) => a.id === articleId)
  const { isArticleFav, toggleArticle } = useFavorites()

  if (!lecture || !article) {
    return <div className="empty-state">Статья не найдена.</div>
  }

  const fav = isArticleFav(lecture.id, article.id)

  return (
    <div>
      <button className="back-link" onClick={() => navigate(`/reference/${lecture.id}`)}>
        ‹ {lecture.title}
      </button>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <h1 className="screen-title" style={{ flex: 1 }}>{article.title}</h1>
        <button
          className={`star-btn ${fav ? 'active' : ''}`}
          onClick={() => toggleArticle(lecture.id, article.id)}
          aria-label="В избранное"
        >
          {fav ? '★' : '☆'}
        </button>
      </div>
      <p className="pill" style={{ marginBottom: 14 }}>Лекция {lecture.num} · {lecture.title}</p>
      <TermText text={article.body} />
    </div>
  )
}
