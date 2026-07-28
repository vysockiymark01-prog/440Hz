import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatEngine } from '../../hooks/useBeatEngine.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'

const BASE = 440
const TOLERANCE = 0.3

// Адаптивная сложность: чем длиннее серия верных ответов подряд, тем чаще
// попадаются трудноразличимые случаи (очень медленные и очень быстрые биения).
function randomDiff(streak = 0) {
  if (streak >= 6) {
    return Math.round((0.5 + Math.random() * 4.5) * 10) / 10 // весь диапазон, включая края
  }
  if (streak >= 3) {
    return Math.round((0.8 + Math.random() * 3.4) * 10) / 10 // средняя сложность
  }
  return Math.round((1.2 + Math.random() * 1.8) * 10) / 10 // комфортная середина
}

function difficultyLabel(streak) {
  if (streak >= 6) return 'сложно'
  if (streak >= 3) return 'средне'
  return 'легко'
}

export default function CountBeats() {
  const navigate = useNavigate()
  const { start, stop, isPlaying } = useBeatEngine()
  const [stats, setStats] = useLocalStorage('pt_count_stats_v1', { attempts: 0, correct: 0, totalError: 0, streak: 0 })
  const [diff, setDiff] = useState(() => randomDiff(stats.streak))
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const { recordActivity } = useTrainerStreak()
  const revealedRef = useRef(false)

  useEffect(() => () => stop(), [stop])

  const play = useCallback(() => {
    start(BASE, BASE + diff, 0.18)
  }, [start, diff])

  const newRound = () => {
    stop()
    revealedRef.current = false
    setDiff(randomDiff(stats.streak))
    setAnswer('')
    setResult(null)
  }

  const submit = () => {
    const guess = parseFloat(answer.replace(',', '.'))
    if (Number.isNaN(guess)) return
    const error = Math.abs(guess - diff)
    const good = error <= TOLERANCE
    setResult({ good, error, actual: diff })
    setStats((s) => ({
      attempts: s.attempts + 1,
      correct: s.correct + (good ? 1 : 0),
      totalError: s.totalError + error,
      streak: good ? (s.streak || 0) + 1 : 0,
    }))
    stop()
    recordActivity()
  }

  const avgError = stats.attempts ? (stats.totalError / stats.attempts).toFixed(2) : '—'
  const accuracy = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ Тренажёр</button>
      <h1 className="screen-title">Посчитай биения</h1>
      <p className="screen-subtitle">Сыграйте пару и определите на слух скорость биений в секунду (0.5–5 Гц)</p>

      <div className="stat-grid">
        <div className="stat-box"><div className="v">{stats.attempts}</div><div className="l">попыток</div></div>
        <div className="stat-box"><div className="v">{accuracy}%</div><div className="l">точность</div></div>
        <div className="stat-box"><div className="v">{avgError}</div><div className="l">ср. ошибка, Гц</div></div>
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
        сложность сейчас: {difficultyLabel(stats.streak || 0)} · серия верных: {stats.streak || 0}
      </div>

      {isPlaying ? (
        <button className="btn btn-block" onClick={stop}>⏸ Остановить</button>
      ) : (
        <button className="btn btn-block" onClick={play}>▶ Проиграть пару</button>
      )}

      <div style={{ margin: '16px 0' }}>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Ваш ответ, Гц (например 2.5)"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>

      <button className="btn btn-block btn-primary" onClick={submit} disabled={!answer}>
        Проверить
      </button>

      {result && (
        <>
          <div className={`result-flash ${result.good ? 'good' : 'bad'}`}>
            {result.good ? 'Точно!' : 'Мимо'} Правильный ответ: {result.actual.toFixed(1)} Гц
            {' '}(ваша ошибка {result.error.toFixed(1)} Гц)
          </div>
          <button className="btn btn-block" onClick={newRound}>Следующая пара →</button>
        </>
      )}
    </div>
  )
}
