import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import symptomQuiz from '../../data/symptomQuiz.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function SymptomQuiz() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [best, setBest] = useLocalStorage('pt_symptom_quiz_best_v1', null)
  const { t, tr } = useLanguage()

  const question = symptomQuiz[index]
  const isLast = index === symptomQuiz.length - 1

  const choose = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === question.correctIndex) setScore((s) => s + 1)
  }

  const next = () => {
    if (isLast) {
      const finalScore = score
      if (!best || finalScore > best.score) {
        setBest({ score: finalScore, total: symptomQuiz.length })
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
  }

  if (finished) {
    const pct = Math.round((score / symptomQuiz.length) * 100)
    return (
      <div>
        <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
        <h1 className="screen-title">{t('sq_result_title')}</h1>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="big-number">{score}/{symptomQuiz.length}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{pct}% {t('sq_correct_pct')}</div>
        </div>
        <button className="btn btn-block btn-primary" onClick={restart}>{t('sq_restart')}</button>
        <button className="btn btn-block" style={{ marginTop: 10 }} onClick={() => navigate('/tools')}>
          {t('sq_to_tools')}
        </button>
      </div>
    )
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
      <h1 className="screen-title">{t('sq_title')}</h1>
      <p className="screen-subtitle">
        {t('sq_question_progress', { n: index + 1, total: symptomQuiz.length })}
        {best ? `${t('sq_best_result')} ${best.score}/${best.total}` : ''}
      </p>

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
          {isLast ? t('sq_finish') : t('sq_next')}
        </button>
      )}
    </div>
  )
}
