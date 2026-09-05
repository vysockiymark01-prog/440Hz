import { Link, useNavigate } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import glossary from '../../data/glossary.js'
import { useFavorites } from '../../hooks/useFavorites.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function Favorites() {
  const navigate = useNavigate()
  const { t } = useLanguage()
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
      <button className="back-link" onClick={() => navigate('/more')}>‹ {t('back_more')}</button>
      <h1 className="screen-title">{t('fav_title')}</h1>

      {isEmpty && (
        <div className="empty-state">
          {t('fav_empty_line1')}<br />{t('fav_empty_line2')}
        </div>
      )}

      {favArticles.length > 0 && (
        <>
          <div className="section-label">{t('fav_articles_label')}</div>
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
          <div className="section-label">{t('fav_terms_label')}</div>
          {favTerms.map((term) => (
            <Link key={term.id} to={`/reference/glossary/${term.id}`} className="card-tap row">
              <span style={{ fontWeight: 700 }}>{term.term}</span>
              <span>›</span>
            </Link>
          ))}
        </>
      )}
    </div>
  )
}
