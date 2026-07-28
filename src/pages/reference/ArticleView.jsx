import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import TermText from '../../components/TermText.jsx'
import ArticleImages from '../../components/ArticleImages.jsx'
import { useFavorites } from '../../hooks/useFavorites.js'

export default function ArticleView() {
  const { lectureId, articleId } = useParams()
  const navigate = useNavigate()
  const lecture = lectures.find((l) => l.id === lectureId)
  const article = lecture?.articles.find((a) => a.id === articleId)
  const { isArticleFav, toggleArticle } = useFavorites()
  const [speaking, setSpeaking] = useState(false)
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => {
    if (ttsSupported) window.speechSynthesis.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureId, articleId])

  const toggleSpeech = useCallback(() => {
    if (!ttsSupported || !article) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(`${article.title}. ${article.body}`)
    utterance.lang = 'ru-RU'
    utterance.rate = 0.95
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }, [ttsSupported, article, speaking])

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
      {ttsSupported && (
        <button className="btn btn-block" style={{ marginBottom: 14 }} onClick={toggleSpeech}>
          {speaking ? '⏹️ Остановить озвучку' : '🔊 Прослушать статью'}
        </button>
      )}
      <TermText text={article.body} />
      <ArticleImages articleId={article.id} />
    </div>
  )
}
