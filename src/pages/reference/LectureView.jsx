import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import { useFavorites } from '../../hooks/useFavorites.js'
import { useCourseProgress } from '../../contexts/CourseProgressContext.jsx'

const PRACTICE_LINKS = {
  l2: [
    { to: '/trainer/listen', icon: '🌊', label: 'Послушать биения' },
    { to: '/trainer/count', icon: '🔢', label: 'Посчитай биения' },
  ],
  l3: [
    { to: '/trainer/unison', icon: '🎯', label: 'Сведи унисон' },
    { to: '/trainer/temperament', icon: '🎼', label: 'Темперация по кругу квинт' },
  ],
  l4: [
    { to: '/tools/work-order', icon: '📋', label: 'Порядок работ на выезде' },
  ],
  l8: [
    { to: '/tools/symptom-quiz', icon: '🩺', label: 'Тест по симптомам и шумам' },
  ],
  l9: [
    { to: '/tools/diagnostic', icon: '🔍', label: 'Чек-лист диагностики' },
    { to: '/tools/common-mistakes', icon: '⚠️', label: 'Частые ошибки новичка' },
  ],
}

export default function LectureView() {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const lecture = lectures.find((l) => l.id === lectureId)
  const { isArticleFav, toggleArticle } = useFavorites()
  const { isLectureUnlocked, unlockDateFor, lockReason, notes, setNote } = useCourseProgress()
  const [noteDraft, setNoteDraft] = useState('')

  useEffect(() => {
    setNoteDraft(notes[lectureId] || '')
  }, [lectureId, notes])

  if (!lecture) {
    return (
      <div className="empty-state">Раздел не найден.</div>
    )
  }

  if (!isLectureUnlocked(lecture.id)) {
    const reason = lockReason(lecture.id)
    return (
      <div>
        <button className="back-link" onClick={() => navigate('/reference')}>‹ Справочник</button>
        <h1 className="screen-title">Лекция {lecture.num}. {lecture.title}</h1>
        <div className="empty-state">
          {reason === 'prev_test'
            ? 'Эта тема пока закрыта — сначала пройдите тест по предыдущей теме.'
            : `Эта тема откроется ${new Date(unlockDateFor(lecture.id)).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в ${new Date(unlockDateFor(lecture.id)).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}.`}
        </div>
      </div>
    )
  }

  const practiceLinks = PRACTICE_LINKS[lecture.id]

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

      {practiceLinks && (
        <>
          <div className="section-label">Практика по теме</div>
          {practiceLinks.map((t) => (
            <Link key={t.to} to={t.to} className="card-tap row">
              <span className="row-start">{t.icon} <span>{t.label}</span></span>
              <span>›</span>
            </Link>
          ))}
        </>
      )}

      <div className="section-label">Мои заметки</div>
      <div className="card">
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => setNote(lecture.id, noteDraft)}
          placeholder="Запишите мысли или вопросы по этой лекции…"
          rows={4}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontFamily: 'inherit',
            fontSize: 14,
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  )
}
