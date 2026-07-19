import { Link, useNavigate } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import glossary from '../../data/glossary.js'
import { useFavorites } from '../../hooks/useFavorites.js'

export default function Favorites() {
  const navigate = useNavigate()
  const { favorites } = useFavorites()

  const favArticles = favorites.articles
    .map(({ lectureId, articleId }) => {
      const lecture = lectures.find((l) => l.id === lectureId)
      const article = lecture?.articles.find((a) => a.id === articleId)
      return article ? { lecture, article } : null
    })
    .filter(Boolean)

  const favTerms = favorites.terms
    .map((id) => glossary.find((g) => g.id === id))
    .filter(Boolean)

  const isEmpty = favArticles.length === 0 && favTerms.length === 0

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">Избранное</h1>

      {isEmpty && (
        <div className="empty-state">
          Пока ничего не добавлено.<br />Нажмите ☆ на статье или термине глоссария.
        </div>
      )}

      {favArticles.length > 0 && (
        <>
          <div className="section-label">Статьи</div>
          {favArticles.map(({ lecture, article }) => (
            <Link key={article.id} to={`/reference/${lecture.id}/${article.id}`} className="card-tap row">
              <span>
                <div style={{ fontWeight: 700 }}>{article.title}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{lecture.title}</div>
              </span>
              <span>›</span>
            </Link>
          ))}
        </>
      )}

      {favTerms.length > 0 && (
        <>
          <div className="section-label">Термины</div>
          {favTerms.map((t) => (
            <Link key={t.id} to={`/reference/glossary/${t.id}`} className="card-tap row">
              <span style={{ fontWeight: 700 }}>{t.term}</span>
              <span>›</span>
            </Link>
          ))}
        </>
      )}
    </div>
  )
}
