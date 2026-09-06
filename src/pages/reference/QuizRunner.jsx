import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import quizzes from '../../data/quizzes.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useCourseProgress } from '../../contexts/CourseProgressContext.jsx'
import { pickQuote, finalQuote } from '../../data/quotes.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function QuizRunner() {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const { t, tr } = useLanguage()
  const lecture = lectures.find((l) => l.id === lectureId)
  const questions = useMemo(() => quizzes[lectureId] || [], [lectureId])
  const {
    isLectureUnlocked, lockReason, unlockDateFor,
    markTestPassed, testsPassed, quotesSeen, markQuoteSeen,
    status, totalLectures, courseCompleteSeen, markCourseCompleteSeen,
  } = useCourseProgress()

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [results, setResults] = useLocalStorage('pt_quiz_results_v1', {})
  const [wrongByLecture, setWrongByLecture] = useLocalStorage('pt_quiz_wrong_v1', {})
  const [quote, setQuote] = useState(null)
  const [courseJustCompleted, setCourseJustCompleted] = useState(false)
  const [wrongAnswers, setWrongAnswers] = useState([])

  if (!lecture || questions.length === 0) {
    return <div className="empty-state">{t('qr_not_found')}</div>
  }

  if (!isLectureUnlocked(lecture.id)) {
    const reason = lockReason(lecture.id)
    return (
      <div>
        <button className="back-link" onClick={() => navigate('/reference/quiz')}>‹ {t('qh_title')}</button>
        <h1 className="screen-title">{tr(lecture.title)}</h1>
        <div className="empty-state">
          {reason === 'prev_test'
            ? t('qr_locked_prev_test')
            : t('qr_locked_until', { date: new Date(unlockDateFor(lecture.id)).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) })}
        </div>
      </div>
    )
  }

  const question = questions[index]
  const isLast = index === questions.length - 1

  const choose = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === question.correctIndex) setScore((s) => s + 1)
  }

  const next = () => {
    const wrongEntry = selected !== question.correctIndex
      ? { q: question.q, correct: question.options[question.correctIndex] }
      : null
    const updatedWrong = wrongEntry ? [...wrongAnswers, wrongEntry] : wrongAnswers
    setWrongAnswers(updatedWrong)

    if (isLast) {
      const finalScore = score
      const prevBest = results[lectureId]
      if (!prevBest || finalScore > prevBest.score) {
        setResults((r) => ({ ...r, [lectureId]: { score: finalScore, total: questions.length } }))
      }
      setWrongByLecture((w) => ({ ...w, [lectureId]: updatedWrong }))
      if (finalScore >= 1) {
        const alreadyPassed = !!testsPassed[lectureId]
        markTestPassed(lectureId)
        const { index: qi, quote: q } = pickQuote(quotesSeen)
        markQuoteSeen(qi)
        setQuote(q)
        if (!alreadyPassed) {
          const newPassedCount = Object.keys(testsPassed).length + 1
          if (status === 'novice' && newPassedCount >= totalLectures && !courseCompleteSeen) {
            setCourseJustCompleted(true)
            markCourseCompleteSeen()
          }
        }
      }
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
    }
  }

  const restart = () => {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
    setQuote(null)
    setWrongAnswers([])
  }

  if (finished && courseJustCompleted) {
    return (
      <div>
        <h1 className="screen-title">{t('qr_course_complete_title')}</h1>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>{t('qr_course_complete_desc')}</div>
          <div style={{ fontStyle: 'italic', color: 'var(--text)', marginBottom: 6 }}>«{tr(finalQuote.text)}»</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>— {finalQuote.author}</div>
        </div>
        <button className="btn btn-block btn-primary" onClick={() => navigate('/reference')}>{t('qr_to_reference')}</button>
      </div>
    )
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div>
        <button className="back-link" onClick={() => navigate('/reference/quiz')}>‹ {t('qh_title')}</button>
        <h1 className="screen-title">{t('qr_result_title')}</h1>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="big-number">{score}/{questions.length}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{pct}% {t('qr_correct_pct')}</div>
        </div>
        {quote && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontStyle: 'italic', marginBottom: 6 }}>«{tr(quote.text)}»</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>— {quote.author}</div>
          </div>
        )}

        {wrongAnswers.length > 0 && (
          <>
            <div className="section-label">{t('qr_review_label')}</div>
            <div className="card">
              {wrongAnswers.map((w, i) => (
                <div key={i} style={{ marginBottom: i < wrongAnswers.length - 1 ? 12 : 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{tr(w.q)}</div>
                  <div style={{ color: 'var(--success)', fontSize: 13, marginTop: 2 }}>{t('qr_correct_was', { answer: tr(w.correct) })}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-block" onClick={() => navigate(`/reference/${lectureId}`)}>
              {t('qr_repeat_lecture')}
            </button>
          </>
        )}

        <button className="btn btn-block btn-primary" style={{ marginTop: 10 }} onClick={restart}>{t('qr_restart')}</button>
        <button className="btn btn-block" style={{ marginTop: 10 }} onClick={() => navigate('/reference/quiz')}>
          {t('qr_to_quiz_list')}
        </button>
      </div>
    )
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference/quiz')}>‹ {t('qh_title')}</button>
      <h1 className="screen-title">{tr(lecture.title)}</h1>
      <p className="screen-subtitle">{t('qr_question_progress', { n: index + 1, total: questions.length })}</p>

      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 14 }}>{tr(question.q)}</div>
        {question.options.map((opt, i) => {
          let cls = 'theme-option'
          if (selected !== null) {
            if (i === question.correctIndex) cls += ' quiz-correct'
            else if (i === selected) cls += ' quiz-wrong'
          }
          return (
            <button key={i} className={cls} style={{ marginBottom: 8 }} onClick={() => choose(i)}>
              <span>{tr(opt)}</span>
              {selected !== null && i === question.correctIndex && <span className="check" style={{ visibility: 'visible' }}>✓</span>}
              {selected !== null && i === selected && i !== question.correctIndex && <span className="check" style={{ visibility: 'visible', color: 'var(--danger)' }}>✕</span>}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <button className="btn btn-block btn-primary" onClick={next}>
          {isLast ? t('qr_finish') : t('qr_next')}
        </button>
      )}
    </div>
  )
}
