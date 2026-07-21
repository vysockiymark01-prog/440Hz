import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatEngine } from '../../hooks/useBeatEngine.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

const MIN_PITCH = 438
const MAX_PITCH = 443
const DEFAULT_PITCH = 440

export default function TuningFork() {
  const navigate = useNavigate()
  const [pitch, setPitch] = useLocalStorage('pt_tuner_pitch_v1', DEFAULT_PITCH)
  const { start, stop, setFreqA, setFreqB, isPlaying } = useBeatEngine()

  useEffect(() => {
    if (isPlaying) {
      setFreqA(pitch)
      setFreqB(pitch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pitch, isPlaying])

  useEffect(() => () => stop(), [stop])

  const toggle = () => {
    if (isPlaying) stop()
    else start(pitch, pitch, 0.2)
  }

  const reset = () => setPitch(DEFAULT_PITCH)

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Камертон</h1>
      <p className="screen-subtitle">
        Ровный эталонный тон для сверки на слух. По умолчанию 440 Гц — можно сдвинуть под строй заказчика.
      </p>

      <div className="card" style={{ textAlign: 'center' }}>
        <div className="big-number">{pitch.toFixed(0)} Гц</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          {pitch === DEFAULT_PITCH ? 'Стандартный камертонный строй' : `Отклонение от 440: ${pitch > DEFAULT_PITCH ? '+' : ''}${pitch - DEFAULT_PITCH} Гц`}
        </div>
      </div>

      <input
        className="freq-slider"
        type="range"
        min={MIN_PITCH}
        max={MAX_PITCH}
        step="1"
        value={pitch}
        onChange={(e) => setPitch(parseFloat(e.target.value))}
      />
      <div className="row" style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: -6, marginBottom: 16 }}>
        <span>{MIN_PITCH} Гц</span>
        <span>{MAX_PITCH} Гц</span>
      </div>

      <button className="btn btn-block btn-primary" onClick={toggle}>
        {isPlaying ? '⏸ Остановить' : '▶ Играть тон'}
      </button>

      {pitch !== DEFAULT_PITCH && (
        <button className="btn btn-block" style={{ marginTop: 10 }} onClick={reset}>
          Вернуть 440 Гц
        </button>
      )}
    </div>
  )
}
