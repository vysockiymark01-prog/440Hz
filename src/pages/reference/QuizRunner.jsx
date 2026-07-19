import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import lectures from '../../data/lectures.js'
import quizzes from '../../data/quizzes.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

export default function QuizRunner() {
  const { lectureId } = useParams()
  const navigate = useNavigate()
  const lecture = lectures.find((l) => l.id === lectureId)
  const questions = useMemo(() => quizzes[lectureId] || [], [lectureId])

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [results, setResults] = useLocalStorage('pt_quiz_results_v1', {})

  if (!lecture || questions.length === 0) {
    return <div className="empty-state">Тест не найден.</div>
  }

  const question = questions[index]
  const isLast = index === questions.length - 1

  const choose = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === question.correctIndex) setScore((s) => s + 1)
  }

  const next = () => {
    if (isLast) {
      const finalScore = score
      const prevBest = results[lectureId]
      if (!prevBest || finalScore > prevBest.score) {
        setResults((r) => ({ ...r, [lectureId]: { score: finalScore, total: questions.length } }))
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
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div>
        <button className="back-link" onClick={() => navigate('/reference/quiz')}>‹ Тесты по темам</button>
        <h1 className="screen-title">Результат</h1>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="big-number">{score}/{questions.length}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{pct}% правильных ответов</div>
        </div>
        <button className="btn btn-block btn-primary" onClick={restart}>Пройти ещё раз</button>
        <button className="btn btn-block" style={{ marginTop: 10 }} onClick={() => navigate('/reference/quiz')}>
          К списку тестов
        </button>
      </div>
    )
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/reference/quiz')}>‹ Тесты по темам</button>
      <h1 className="screen-title">{lecture.title}</h1>
      <p className="screen-subtitle">Вопрос {index + 1} из {questions.length}</p>

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
          {isLast ? 'Завершить тест' : 'Следующий вопрос →'}
        </button>
      )}
    </div>
  )
}
