import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatEngine } from '../../hooks/useBeatEngine.js'
import BeatVisualizer from '../../components/BeatVisualizer.jsx'

const BASE = 440
const SUCCESS_TOLERANCE = 0.15

function randomTarget() {
  const magnitude = 0.5 + Math.random() * 3.5
  const sign = Math.random() < 0.5 ? -1 : 1
  return Math.round(magnitude * sign * 20) / 20
}

export default function MergeUnison() {
  const navigate = useNavigate()
  const { start, stop, setFreqB, getAnalyser, isPlaying } = useBeatEngine()
  const [hiddenTarget, setHiddenTarget] = useState(randomTarget)
  const [knob, setKnob] = useState(0)
  const [revealed, setRevealed] = useState(null)
  // mode: 'idle' | 'exercise' | 'demo-zero' | 'demo-one' — различает, что сейчас
  // звучит, чтобы слайдер «ключа» не переопределял частоту во время примеров.
  const [mode, setMode] = useState('idle')
  const knobRef = useRef(knob)
  knobRef.current = knob

  const currentOffset = hiddenTarget + knob

  useEffect(() => {
    if (isPlaying && mode === 'exercise') setFreqB(BASE + currentOffset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knob, hiddenTarget, isPlaying, mode])

  useEffect(() => () => stop(), [stop])

  const play = () => {
    setMode('exercise')
    start(BASE, BASE + currentOffset, 0.18)
  }

  const playDemoZero = () => {
    setMode('demo-zero')
    start(BASE, BASE, 0.18)
  }

  const playDemoOne = () => {
    setMode('demo-one')
    start(BASE, BASE + 1, 0.18)
  }

  const stopAll = () => {
    stop()
    setMode('idle')
  }

  const check = useCallback(() => {
    const error = Math.abs(currentOffset)
    setRevealed({ success: error <= SUCCESS_TOLERANCE, error, target: hiddenTarget })
  }, [currentOffset, hiddenTarget])

  const newRound = () => {
    stop()
    setMode('idle')
    setHiddenTarget(randomTarget())
    setKnob(0)
    setRevealed(null)
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ Тренажёр</button>
      <h1 className="screen-title">Сведи унисон</h1>
      <p className="screen-subtitle">
        Вторая струна случайно расстроена. Крутите «ключ» и по поведению биений сведите унисон в ноль —
        направление смещения не подсказывается.
      </p>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Эталон: с чем сравнивать на слух</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 10 }}>
          Перед тем как крутить ключ, послушайте, как звучит точный унисон (0 биений) и лёгкая расстройка
          (1 биение в секунду) — так проще узнавать это на слух в основном упражнении.
        </p>
        <div className="row" style={{ gap: 8 }}>
          {mode === 'demo-zero' && isPlaying ? (
            <button className="btn" style={{ flex: 1 }} onClick={stopAll}>⏸ Остановить</button>
          ) : (
            <button className="btn" style={{ flex: 1 }} onClick={playDemoZero}>🎧 0 биений</button>
          )}
          {mode === 'demo-one' && isPlaying ? (
            <button className="btn" style={{ flex: 1 }} onClick={stopAll}>⏸ Остановить</button>
          ) : (
            <button className="btn" style={{ flex: 1 }} onClick={playDemoOne}>🎧 1 биение/сек</button>
          )}
        </div>
      </div>

      <BeatVisualizer getAnalyser={getAnalyser} isPlaying={isPlaying} />

      <div style={{ margin: '18px 0 6px' }}>
        <input
          className="freq-slider"
          type="range"
          min="-5"
          max="5"
          step="0.02"
          value={knob}
          onChange={(e) => setKnob(parseFloat(e.target.value))}
        />
        <div className="row" style={{ color: 'var(--text-faint)', fontSize: 12 }}>
          <span>← ключ</span>
          <span>ключ →</span>
        </div>
      </div>

      {mode === 'exercise' && isPlaying ? (
        <button className="btn btn-block" onClick={stopAll}>⏸ Остановить</button>
      ) : (
        <button className="btn btn-block btn-primary" onClick={play}>▶ Играть унисон</button>
      )}

      <button className="btn btn-block btn-primary" style={{ marginTop: 10 }} onClick={check}>
        Проверить унисон
      </button>

      {revealed && (
        <>
          <div className={`result-flash ${revealed.success ? 'good' : 'bad'}`}>
            {revealed.success
              ? 'Унисон сведён чисто!'
              : `Осталось смещение ≈ ${revealed.error.toFixed(2)} Гц`}
          </div>
          <button className="btn btn-block" onClick={newRound}>Новая попытка →</button>
        </>
      )}
    </div>
  )
}
