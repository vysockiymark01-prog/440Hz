import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import TermText from '../../components/TermText.jsx'
import ArticleImages from '../../components/ArticleImages.jsx'
import { useFavorites } from '../../hooks/useFavorites.js'

// Делит текст на предложения — это единица, с которой можно надёжно
// продолжить чтение. Родной SpeechSynthesis.pause()/resume() на многих
// Android-устройствах не работает (звук останавливается и не возобновляется,
// это известная особенность системного TTS-движка Android), поэтому вместо
// него читаем по предложениям и сами запоминаем, на каком остановились.
function splitIntoChunks(article) {
  const body = (article.body || '').replace(/\s+/g, ' ').trim()
  const sentences = body.split(/(?<=[.!?])\s+/).filter(Boolean)
  return [`${article.title}.`, ...sentences]
}

export default function ArticleView() {
  const { lectureId, articleId } = useParams()
  const navigate = useNavigate()
  const lecture = lectures.find((l) => l.id === lectureId)
  const article = lecture?.articles.find((a) => a.id === articleId)
  const { isArticleFav, toggleArticle } = useFavorites()
  // 'idle' — не запущено, 'speaking' — читает, 'paused' — на паузе (можно продолжить с того же места)
  const [speechState, setSpeechState] = useState('idle')
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const chunksRef = useRef([])
  const indexRef = useRef(0)
  // true, пока идёт непрерывное чтение — используется, чтобы отличить
  // "предложение закончилось само" от "чтение прервали паузой/остановкой"
  const runningRef = useRef(false)

  const speakChunk = useCallback((idx) => {
    const chunks = chunksRef.current
    if (idx >= chunks.length) {
      runningRef.current = false
      setSpeechState('idle')
      indexRef.current = 0
      return
    }
    const utterance = new SpeechSynthesisUtterance(chunks[idx])
    utterance.lang = 'ru-RU'
    utterance.rate = 0.95
    utterance.onend = () => {
      if (!runningRef.current) return
      indexRef.current = idx + 1
      speakChunk(indexRef.current)
    }
    utterance.onerror = () => {
      runningRef.current = false
      setSpeechState('idle')
    }
    window.speechSynthesis.speak(utterance)
  }, [])

  useEffect(() => () => {
    runningRef.current = false
    if (ttsSupported) window.speechSynthesis.cancel()
    setSpeechState('idle')
    indexRef.current = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureId, articleId])

  const startSpeech = useCallback(() => {
    if (!ttsSupported || !article) return
    window.speechSynthesis.cancel()
    chunksRef.current = splitIntoChunks(article)
    indexRef.current = 0
    runningRef.current = true
    setSpeechState('speaking')
    speakChunk(0)
  }, [ttsSupported, article, speakChunk])

  const toggleSpeech = useCallback(() => {
    if (!ttsSupported || !article) return
    if (speechState === 'speaking') {
      // Останавливаем именно так, а не через pause() — на Android родная
      // пауза часто не даёт потом продолжить. Текущее предложение при
      // возобновлении прозвучит заново, дальше — с того же места.
      runningRef.current = false
      window.speechSynthesis.cancel()
      setSpeechState('paused')
    } else if (speechState === 'paused') {
      runningRef.current = true
      setSpeechState('speaking')
      speakChunk(indexRef.current)
    } else {
      startSpeech()
    }
  }, [ttsSupported, article, speechState, startSpeech, speakChunk])

  const stopSpeech = useCallback(() => {
    runningRef.current = false
    window.speechSynthesis.cancel()
    indexRef.current = 0
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
