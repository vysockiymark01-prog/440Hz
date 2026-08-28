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
  // 'idle' — не запущено, 'speaking' — читает, 'paused' — на паузе (можно продолжить с того же места)
  const [speechState, setSpeechState] = useState('idle')
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => {
    if (ttsSupported) window.speechSynthesis.cancel()
    setSpeechState('idle')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureId, articleId])

  const startSpeech = useCallback(() => {
    if (!ttsSupported || !article) return
    const utterance = new SpeechSynthesisUtterance(`${article.title}. ${article.body}`)
    utterance.lang = 'ru-RU'
    utterance.rate = 0.95
    utterance.onend = () => setSpeechState('idle')
    utterance.onerror = () => setSpeechState('idle')
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeechState('speaking')
  }, [ttsSupported, article])

  // Пауза/продолжение через speechSynthesis.pause()/resume() — движок сам
  // запоминает место в тексте, начинать заново не нужно.
  const toggleSpeech = useCallback(() => {
    if (!ttsSupported || !article) return
    if (speechState === 'speaking') {
      window.speechSynthesis.pause()
      setSpeechState('paused')
    } else if (speechState === 'paused') {
      window.speechSynthesis.resume()
      setSpeechState('speaking')
    } else {
      startSpeech()
    }
  }, [ttsSupported, article, speechState, startSpeech])

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeechState('idle')
  }, [])

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
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button className="btn btn-block" onClick={toggleSpeech}>
            {speechState === 'speaking' && '⏸️ Пауза'}
            {speechState === 'paused' && '▶️ Продолжить'}
            {speechState === 'idle' && '🔊 Прослушать статью'}
          </button>
          {speechState !== 'idle' && (
            <button className="btn" onClick={stopSpeech} aria-label="Остановить озвучку">⏹️</button>
          )}
        </div>
      )}
      <TermText text={article.body} />
      <ArticleImages articleId={article.id} />
    </div>
  )
}
