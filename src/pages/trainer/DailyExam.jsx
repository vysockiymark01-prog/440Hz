import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatEngine } from '../../hooks/useBeatEngine.js'
import { useDefectEngine } from '../../hooks/useDefectEngine.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'
import { DEFECT_TYPES } from '../../audio/DefectEngine.js'

const BASE = 440
const ROUNDS = 5
const COUNT_TOLERANCE = 0.3

const DEFECT_LABELS = {
  clean: 'Чистый звук',
  buzz: 'Дребезжание',
  harsh: 'Жёсткий тембр (лишние обертона)',
  inharmonic: 'Негармоничность (биения внутри ноты)',
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function randomRound() {
  const kind = Math.random() < 0.5 ? 'count' : 'diagnose'
  if (kind === 'count') {
    return { kind, diff: Math.round((0.5 + Math.random() * 4.5) * 10) / 10 }
  }
  return {
    kind,
    defectType: DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)],
    freq: Math.round(180 + Math.random() * 150),
  }
}

export default function DailyExam() {
  const navigate = useNavigate()
  const beat = useBeatEngine()
  const defect = useDefectEngine()
  const { recordActivity } = useTrainerStreak()
  const [history, setHistory] = useLocalStorage('pt_daily_exam_v1', { history: [] })

  const [roundIndex, setRoundIndex] = useState(0)
  const [rounds] = useState(() => Array.from({ length: ROUNDS }, randomRound))
  const [answer, setAnswer] = useState('')
  const [selected, setSelected] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [revealed, setRevealed] = useState(null)
  const [finished, setFinished] = useState(false)

  const round = rounds[roundIndex]

  useEffect(() => () => { beat.stop(); defect.stop() }, [])

  const playRound = useCallback(() => {
    if (!round) return
    if (round.kind === 'count') {
      beat.start(BASE, BASE + round.diff, 0.18)
    } else {
      defect.play(round.defectType, round.freq)
    }
  }, [round, beat, defect])

  const submitCount = () => {
    const guess = parseFloat(answer.replace(',', '.'))
    if (Number.isNaN(guess)) return
    beat.stop()
    const error = Math.abs(guess - round.diff)
    const good = error <= COUNT_TOLERANCE
    if (good) setCorrectCount((c) => c + 1)
    setRevealed({ good, text: `Правильный ответ: ${round.diff.toFixed(1)} Гц` })
  }

  const chooseDefect = (type) => {
    if (selected !== null) return
    setSelected(type)
    defect.stop()
    const good = type === round.defectType
    if (good) setCorrectCount((c) => c + 1)
    setRevealed({ good, text: `Это был: ${DEFECT_LABELS[round.defectType]}` })
  }

  const nextRound = () => {
    setAnswer('')
    setSelected(null)
    setRevealed(null)
    if (roundIndex + 1 >= ROUNDS) {
      finishExam()
    } else {
      setRoundIndex((i) => i + 1)
    }
  }

  const finishExam = () => {
    setFinished(true)
    recordActivity()
    setHistory((h) => {
      const rest = h.history.filter((entry) => entry.date !== todayStr())
      return { history: [...rest, { date: todayStr(), score: correctCount, total: ROUNDS }].slice(-60) }
    })
  }

  if (finished) {
    const pct = Math.round((correctCount / ROUNDS) * 100)
    return (
      <div>
        <button className="back-link" onClick={() => navigate('/trainer')}>‹ Тренажёр</button>
        <h1 className="screen-title">Экзамен дня — результат</h1>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="big-number">{correctCount}/{ROUNDS}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{pct}% правильных ответов</div>
        </div>
        <button className="btn btn-block btn-primary" onClick={() => navigate('/trainer')}>К тренажёру</button>
      </div>
    )
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ Тренажёр</button>
      <h1 className="screen-title">Экзамен дня</h1>
      <p className="screen-subtitle">Задание {roundIndex + 1} из {ROUNDS} — вперемешку счёт биений и диагностика на слух</p>

      {round.kind === 'count' ? (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>Сколько биений в секунду?</div>
          </div>
          <button className="btn btn-block" style={{ marginTop: 12 }} onClick={playRound}>▶ Проиграть пару</button>
          <div style={{ margin: '16px 0' }}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ваш ответ, Гц (например 2.5)"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={revealed !== null}
            />
          </div>
          {revealed === null && (
            <button className="btn btn-block btn-primary" onClick={submitCount} disabled={!answer}>Проверить</button>
          )}
        </>
      ) : (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>Что за дефект звука?</div>
          </div>
          <button className="btn btn-block" style={{ marginTop: 12 }} onClick={playRound}>▶ Проиграть звук</button>
          <div style={{ marginTop: 16 }}>
            {DEFECT_TYPES.map((type) => {
              let cls = 'theme-option'
              if (selected !== null) {
                if (type === round.defectType) cls += ' quiz-correct'
                else if (type === selected) cls += ' quiz-wrong'
              }
              return (
                <button key={type} className={cls} style={{ marginBottom: 8 }} onClick={() => chooseDefect(type)}>
                  <span>{DEFECT_LABELS[type]}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {revealed && (
        <>
          <div className={`result-flash ${revealed.good ? 'good' : 'bad'}`}>
            {revealed.good ? 'Точно!' : 'Мимо'} {revealed.text}
          </div>
          <button className="btn btn-block btn-primary" style={{ marginTop: 10 }} onClick={nextRound}>
            {roundIndex + 1 >= ROUNDS ? 'Завершить экзамен' : 'Следующее задание →'}
          </button>
        </>
      )}
    </div>
  )
}
