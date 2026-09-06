import { Link, useNavigate } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import quizzes from '../../data/quizzes.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useCourseProgress } from '../../contexts/CourseProgressContext.jsx'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function QuizHome() {
  const navigate = useNavigate()
  const [results] = useLocalStorage('pt_quiz_results_v1', {})
  const { isLectureUnlocked } = useCourseProgress()
  const { t } = useLanguage()

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference')}>‹ {t('back_reference')}</button>
      <h1 className="screen-title">{t('qh_title')}</h1>
      <p className="screen-subtitle">{t('qh_subtitle')}</p>

      {lectures.map((l) => {
        const questions = quizzes[l.id] || []
        const best = results[l.id]
        const unlocked = isLectureUnlocked(l.id)
        if (!unlocked) {
          return (
            <div key={l.id} className="card-tap row" style={{ opacity: 0.55, cursor: 'default' }}>
              <span className="row-start">
                <span className="pill badge-accent">{l.num}</span>
                <span>
                  <div style={{ fontWeight: 700 }}>{l.title}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{t('qh_locked')}</div>
                </span>
              </span>
            </div>
          )
        }
        return (
          <Link key={l.id} to={`/reference/quiz/${l.id}`} className="card-tap row">
            <span className="row-start">
              <span className="pill badge-accent">{l.num}</span>
              <span>
                <div style={{ fontWeight: 700 }}>{l.title}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {t('qh_questions_n', { n: questions.length })}
                  {best ? t('qh_best_result', { score: best.score, total: best.total }) : ''}
                </div>
              </span>
            </span>
            <span>›</span>
          </Link>
        )
      })}
    </div>
  )
}
