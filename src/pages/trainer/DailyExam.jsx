import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatEngine } from '../../hooks/useBeatEngine.js'
import { useDefectEngine } from '../../hooks/useDefectEngine.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'
import { DEFECT_TYPES } from '../../audio/DefectEngine.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const BASE = 440
const ROUNDS = 5
const COUNT_TOLERANCE = 0.3

const DEFECT_LABEL_KEYS = {
  clean: 'ed_label_clean',
  buzz: 'ed_label_buzz',
  harsh: 'ed_label_harsh',
  inharmonic: 'ed_label_inharmonic',
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
  const { t } = useLanguage()

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
    setRevealed({ good, text: t('de_correct_answer', { n: round.diff.toFixed(1) }) })
  }

  const chooseDefect = (type) => {
    if (selected !== null) return
    setSelected(type)
    defect.stop()
    const good = type === round.defectType
    if (good) setCorrectCount((c) => c + 1)
    setRevealed({ good, text: t('de_it_was', { label: t(DEFECT_LABEL_KEYS[round.defectType]) }) })
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
        <button className="back-link" onClick={() => navigate('/trainer')}>‹ {t('back_trainer')}</button>
        <h1 className="screen-title">{t('de_result_title')}</h1>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="big-number">{correctCount}/{ROUNDS}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{pct}% {t('de_correct_pct')}</div>
        </div>
        <button className="btn btn-block btn-primary" onClick={() => navigate('/trainer')}>{t('de_to_trainer')}</button>
      </div>
    )
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ {t('back_trainer')}</button>
      <h1 className="screen-title">{t('de_title')}</h1>
      <p className="screen-subtitle">{t('de_task_progress', { n: roundIndex + 1, total: ROUNDS })}</p>

      {round.kind === 'count' ? (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>{t('de_how_many_beats')}</div>
          </div>
          <button className="btn btn-block" style={{ marginTop: 12 }} onClick={playRound}>{t('de_play_pair')}</button>
          <div style={{ margin: '16px 0' }}>
            <input
              type="text"
              inputMode="decimal"
              placeholder={t('de_answer_placeholder')}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={revealed !== null}
            />
          </div>
          {revealed === null && (
            <button className="btn btn-block btn-primary" onClick={submitCount} disabled={!answer}>{t('de_check')}</button>
          )}
        </>
      ) : (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>{t('de_what_defect')}</div>
          </div>
          <button className="btn btn-block" style={{ marginTop: 12 }} onClick={playRound}>{t('de_play_sound')}</button>
          <div style={{ marginTop: 16 }}>
            {DEFECT_TYPES.map((type) => {
              let cls = 'theme-option'
              if (selected !== null) {
                if (type === round.defectType) cls += ' quiz-correct'
                else if (type === selected) cls += ' quiz-wrong'
              }
              return (
                <button key={type} className={cls} style={{ marginBottom: 8 }} onClick={() => chooseDefect(type)}>
                  <span>{t(DEFECT_LABEL_KEYS[type])}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {revealed && (
        <>
          <div className={`result-flash ${revealed.good ? 'good' : 'bad'}`}>
            {revealed.good ? t('de_correct') : t('de_wrong')} {revealed.text}
          </div>
          <button className="btn btn-block btn-primary" style={{ marginTop: 10 }} onClick={nextRound}>
            {roundIndex + 1 >= ROUNDS ? t('de_finish_exam') : t('de_next_task')}
          </button>
        </>
      )}
    </div>
  )
}
