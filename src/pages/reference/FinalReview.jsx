import { useNavigate, Link } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useCourseProgress } from '../../contexts/CourseProgressContext.jsx'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function FinalReview() {
  const navigate = useNavigate()
  const { notes } = useCourseProgress()
  const { t, tr } = useLanguage()
  const [wrongByLecture] = useLocalStorage('pt_quiz_wrong_v1', {})

  const lecturesWithNotes = lectures.filter((l) => notes[l.id] && notes[l.id].trim())
  const lecturesWithWrong = lectures.filter((l) => wrongByLecture[l.id]?.length > 0)

  const hasAnything = lecturesWithNotes.length > 0 || lecturesWithWrong.length > 0

  return (
    <div>
      <button className="back-link no-print" onClick={() => navigate('/reference')}>‹ {t('back_reference')}</button>
      <h1 className="screen-title">{t('fr_title')}</h1>
      <p className="screen-subtitle">
        {t('fr_subtitle')}
      </p>

      {hasAnything && (
        <button className="btn btn-block btn-primary no-print" style={{ marginBottom: 16 }} onClick={() => window.print()}>
          {t('fr_print_btn')}
        </button>
      )}

      {!hasAnything && (
        <div className="empty-state">
          {t('fr_empty')}
        </div>
      )}

      {lecturesWithWrong.length > 0 && (
        <>
          <div className="section-label">{t('fr_wrong_label')}</div>
          {lecturesWithWrong.map((l) => (
            <div key={l.id} className="card">
              <div className="row" style={{ alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{tr(l.title)}</div>
                <Link to={`/reference/quiz/${l.id}`} className="btn btn-sm no-print">{t('fr_retry_quiz')}</Link>
              </div>
              {wrongByLecture[l.id].map((w, i) => (
                <div key={i} style={{ marginBottom: i < wrongByLecture[l.id].length - 1 ? 10 : 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{tr(w.q)}</div>
                  <div style={{ color: 'var(--success)', fontSize: 13, marginTop: 2 }}>{t('fr_correct_was', { answer: tr(w.correct) })}</div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {lecturesWithNotes.length > 0 && (
        <>
          <div className="section-label">{t('fr_notes_label')}</div>
          {lecturesWithNotes.map((l) => (
            <div key={l.id} className="card">
              <div className="row" style={{ alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontWeight: 700 }}>{tr(l.title)}</div>
                <Link to={`/reference/${l.id}`} className="btn btn-sm no-print">{t('fr_to_lecture')}</Link>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-dim)', fontSize: 14 }}>{notes[l.id]}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
