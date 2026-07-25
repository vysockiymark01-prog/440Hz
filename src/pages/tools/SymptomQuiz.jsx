import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import symptomQuiz from '../../data/symptomQuiz.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

export default function SymptomQuiz() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [best, setBest] = useLocalStorage('pt_symptom_quiz_best_v1', null)

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
        <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
        <h1 className="screen-title">Результат</h1>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="big-number">{score}/{symptomQuiz.length}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{pct}% правильных ответов</div>
        </div>
        <button className="btn btn-block btn-primary" onClick={restart}>Пройти ещё раз</button>
        <button className="btn btn-block" style={{ marginTop: 10 }} onClick={() => navigate('/tools')}>
          К инструментам
        </button>
      </div>
    )
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Определи неисправность</h1>
      <p className="screen-subtitle">
        Вопрос {index + 1} из {symptomQuiz.length}
        {best ? ` · лучший результат ${best.score}/${best.total}` : ''}
      </p>

      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 14 }}>{question.q}</div>
        {question.options.map((opt, i) => {
          let cls = 'theme-option'
          if (selected !== null) {
            if (i === question.correctIndex) cls += ' quiz-correct'
            else if (i === selected) cls += ' quiz-wrong'
          }
          return (
            <button key={i} className={cls} style={{ marginBottom: 8 }} onClick={() => choose(i)}>
              <span>{opt}</span>
              {selected !== null && i === question.correctIndex && <span className="check" style={{ visibility: 'visible' }}>✓</span>}
              {selected !== null && i === selected && i !== question.correctIndex && <span className="check" style={{ visibility: 'visible', color: 'var(--danger)' }}>✕</span>}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <button className="btn btn-block btn-primary" onClick={next}>
          {isLast ? 'Завершить' : 'Следующий вопрос →'}
        </button>
      )}
    </div>
  )
}
