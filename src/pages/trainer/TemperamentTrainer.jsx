import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import temperamentChain, { beatRate } from '../../data/temperamentChain.js'
import { useTemperamentEngine } from '../../hooks/useTemperamentEngine.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'
import BeatVisualizer from '../../components/BeatVisualizer.jsx'

const SUCCESS_TOLERANCE_CENTS = 5
const MAX_HIDDEN_CENTS = 20
const MIN_HIDDEN_CENTS = 8

function randomHiddenCents() {
  const magnitude = MIN_HIDDEN_CENTS + Math.random() * (MAX_HIDDEN_CENTS - MIN_HIDDEN_CENTS)
  const sign = Math.random() < 0.5 ? -1 : 1
  return Math.round(magnitude * sign * 10) / 10
}

const DEFAULT_PROGRESS = { stepIndex: 0, attempts: 0, correct: 0, sumAbsCents: 0 }

export default function TemperamentTrainer() {
  const navigate = useNavigate()
  const { start, stop, setFreqB, getAnalyser, isPlaying } = useTemperamentEngine()
  const { recordActivity } = useTrainerStreak()
  const [progress, setProgress] = useLocalStorage('pt_temperament_progress_v1', DEFAULT_PROGRESS)
  const [hiddenCents, setHiddenCents] = useState(randomHiddenCents)
  const [knob, setKnob] = useState(0)
  const [revealed, setRevealed] = useState(null)

  const stepIndex = Math.min(progress.stepIndex, temperamentChain.length - 1)
  const step = temperamentChain[stepIndex]

  const currentOffsetCents = hiddenCents + knob
  const actualToFreq = step.toFreq * 2 ** (currentOffsetCents / 1200)

  useEffect(() => {
    if (isPlaying) setFreqB(actualToFreq)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knob, hiddenCents, stepIndex, isPlaying])

  useEffect(() => () => stop(), [stop])

  const play = () => {
    start(step.fromFreq, actualToFreq, 0.14)
  }

  const check = useCallback(() => {
    const error = Math.abs(currentOffsetCents)
    const success = error <= SUCCESS_TOLERANCE_CENTS
    const heardBeat = beatRate(
      Math.min(step.fromFreq, actualToFreq),
      Math.max(step.fromFreq, actualToFreq),
      step.kind
    )
    setRevealed({ success, error, heardBeat })
    setProgress((p) => ({
      ...p,
      attempts: p.attempts + 1,
      correct: p.correct + (success ? 1 : 0),
      sumAbsCents: p.sumAbsCents + error,
    }))
    recordActivity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOffsetCents, step, actualToFreq, recordActivity])

  const nextStep = () => {
    stop()
    setHiddenCents(randomHiddenCents())
    setKnob(0)
    setRevealed(null)
    setProgress((p) => ({ ...p, stepIndex: Math.min(p.stepIndex + 1, temperamentChain.length - 1) }))
  }

  const retryStep = () => {
    stop()
    setHiddenCents(randomHiddenCents())
    setKnob(0)
    setRevealed(null)
  }

  const restartChain = () => {
    stop()
    setHiddenCents(randomHiddenCents())
    setKnob(0)
    setRevealed(null)
    setProgress((p) => ({ ...p, stepIndex: 0 }))
  }

  const avgError = progress.attempts ? (progress.sumAbsCents / progress.attempts).toFixed(1) : '—'
  const isLastStep = stepIndex === temperamentChain.length - 1
  const isChainDone = isLastStep && revealed

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ Тренажёр</button>
      <h1 className="screen-title">Темперация по кругу квинт</h1>
      <p className="screen-subtitle">
        Реальная цепочка кварто-квинтового метода на настоящих частотах равномерной темперации (12-TET).
        Опорная нота цепочки — <Link to="/tools/tuning-fork">Ля 440 Гц</Link>, дальше строится
        октава и одиннадцать квинт/кварт.
      </p>

      <div className="stat-grid">
        <div className="stat-box"><div className="v">{stepIndex + 1}/{temperamentChain.length}</div><div className="l">интервал</div></div>
        <div className="stat-box"><div className="v">{progress.attempts ? Math.round((progress.correct / progress.attempts) * 100) : 0}%</div><div className="l">точность</div></div>
        <div className="stat-box"><div className="v">{avgError}</div><div className="l">ср. ошибка, центов</div></div>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 6 }}>
          <span className="pill badge-accent">{step.kindLabel}</span>
          <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>шаг {step.index} из {step.total}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 17 }}>
          {step.fromLabel} → {step.toLabel}
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 6, marginBottom: 0 }}>
          Опорная нота ({step.fromLabel}) звучит неизменно. Крутите «ключ», чтобы вторая нота встала на своё
          темперированное место — направление смещения не подсказывается.
        </p>
      </div>

      <BeatVisualizer getAnalyser={getAnalyser} isPlaying={isPlaying} />

      <div style={{ margin: '18px 0 6px' }}>
        <input
          className="freq-slider"
          type="range"
          min="-30"
          max="30"
          step="0.2"
          value={knob}
          onChange={(e) => setKnob(parseFloat(e.target.value))}
        />
        <div className="row" style={{ color: 'var(--text-faint)', fontSize: 12 }}>
          <span>← ключ</span>
          <span>ключ →</span>
        </div>
      </div>

      {!isPlaying ? (
        <button className="btn btn-block btn-primary" onClick={play}>▶ Играть интервал</button>
      ) : (
        <button className="btn btn-block" onClick={stop}>⏸ Остановить</button>
      )}

      <button className="btn btn-block btn-primary" style={{ marginTop: 10 }} onClick={check}>
        Проверить
      </button>

      {revealed && (
        <>
          <div className={`result-flash ${revealed.success ? 'good' : 'bad'}`}>
            {revealed.success ? 'Точно в темперации!' : `Отклонение ≈ ${revealed.error.toFixed(1)} центов`}
            <br />
            <span style={{ fontWeight: 400, fontSize: 13 }}>
              Услышанное биение ≈ {revealed.heardBeat.toFixed(2)} Гц · ориентир ≈ {step.targetBeatHz.toFixed(2)} Гц
            </span>
          </div>

          {isChainDone ? (
            <button className="btn btn-block" onClick={restartChain}>Пройти цепочку заново →</button>
          ) : (
            <button className="btn btn-block" onClick={nextStep}>Следующий интервал →</button>
          )}
        </>
      )}

      {!revealed && (
        <button className="btn btn-block" style={{ marginTop: 10 }} onClick={retryStep}>Перемешать интервал заново</button>
      )}
    </div>
  )
}
