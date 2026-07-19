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
  const knobRef = useRef(knob)
  knobRef.current = knob

  const currentOffset = hiddenTarget + knob

  useEffect(() => {
    if (isPlaying) setFreqB(BASE + currentOffset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [knob, hiddenTarget, isPlaying])

  useEffect(() => () => stop(), [stop])

  const play = () => {
    start(BASE, BASE + currentOffset, 0.18)
  }

  const check = useCallback(() => {
    const error = Math.abs(currentOffset)
    setRevealed({ success: error <= SUCCESS_TOLERANCE, error, target: hiddenTarget })
  }, [currentOffset, hiddenTarget])

  const newRound = () => {
    stop()
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

      {!isPlaying ? (
        <button className="btn btn-block btn-primary" onClick={play}>▶ Играть унисон</button>
      ) : (
        <button className="btn btn-block" onClick={() => stop()}>⏸ Остановить</button>
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
