import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import { useFavorites } from '../../hooks/useFavorites.js'
import { useCourseProgress } from '../../contexts/CourseProgressContext.jsx'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const PRACTICE_LINKS = {
  l2: [
    { to: '/trainer/listen', icon: '🌊', labelKey: 'trainer_item_listen' },
    { to: '/trainer/count', icon: '🔢', labelKey: 'trainer_item_count' },
    { to: '/trainer/ear-diagnostics', icon: '🩺', labelKey: 'trainer_item_ear_diagnostics' },
  ],
  l3: [
    { to: '/trainer/unison', icon: '🎯', labelKey: 'trainer_item_unison' },
    { to: '/trainer/temperament', icon: '🎼', labelKey: 'trainer_item_temperament' },
  ],
  l4: [
    { to: '/tools/work-order', icon: '📋', labelKey: 'lv_link_work_order' },
  ],
  l8: [
    { to: '/tools/symptom-quiz', icon: '🩺', labelKey: 'lv_link_symptom_quiz' },
  ],
  l9: [
    { to: '/tools/diagnostic', icon: '🔍', labelKey: 'tools_item_diagnostic' },
    { to: '/tools/common-mistakes', icon: '⚠️', labelKey: 'tools_item_common_mistakes' },
  ],
}

export default function LectureView() {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const lecture = lectures.find((l) => l.id === lectureId)
  const { isArticleFav, toggleArticle } = useFavorites()
  const { isLectureUnlocked, unlockDateFor, lockReason, notes, setNote } = useCourseProgress()
  const { t, tr } = useLanguage()
  const [noteDraft, setNoteDraft] = useState('')

  useEffect(() => {
    setNoteDraft(notes[lectureId] || '')
  }, [lectureId, notes])

  if (!lecture) {
    return (
      <div className="empty-state">{t('lv_not_found')}</div>
    )
  }

  if (!isLectureUnlocked(lecture.id)) {
    const reason = lockReason(lecture.id)
    return (
      <div>
        <button className="back-link" onClick={() => navigate('/reference')}>‹ {t('lv_back_reference')}</button>
        <h1 className="screen-title">{t('lv_lecture_prefix', { num: lecture.num, title: tr(lecture.title) })}</h1>
        <div className="empty-state">
          {reason === 'prev_test'
            ? t('lv_locked_prev_test')
            : t('lv_locked_until', {
                date: new Date(unlockDateFor(lecture.id)).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
                time: new Date(unlockDateFor(lecture.id)).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
              })}
        </div>
      </div>
    )
  }

  const practiceLinks = PRACTICE_LINKS[lecture.id]

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference')}>‹ {t('lv_back_reference')}</button>
      <h1 className="screen-title">{t('lv_lecture_prefix', { num: lecture.num, title: tr(lecture.title) })}</h1>

      {lecture.articles.map((a) => (
        <div key={a.id} className="card-tap row" style={{ padding: 0 }}>
          <Link to={`/reference/${lecture.id}/${a.id}`} style={{ flex: 1, padding: '14px 0 14px 16px', color: 'inherit' }}>
            {tr(a.title)}
          </Link>
          <button
            className={`star-btn ${isArticleFav(lecture.id, a.id) ? 'active' : ''}`}
            style={{ padding: '14px 16px' }}
            onClick={(e) => { e.preventDefault(); toggleArticle(lecture.id, a.id) }}
            aria-label={t('lv_fav_aria')}
          >
            {isArticleFav(lecture.id, a.id) ? '★' : '☆'}
          </button>
        </div>
      ))}

      {practiceLinks && (
        <>
          <div className="section-label">{t('lv_practice_label')}</div>
          {practiceLinks.map((tt) => (
            <Link key={tt.to} to={tt.to} className="card-tap row">
              <span className="row-start">{tt.icon} <span>{t(tt.labelKey)}</span></span>
              <span>›</span>
            </Link>
          ))}
        </>
      )}

      <div className="section-label">{t('lv_notes_label')}</div>
      <div className="card">
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => setNote(lecture.id, noteDraft)}
          placeholder={t('lv_notes_placeholder')}
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
