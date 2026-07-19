import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatEngine } from '../../hooks/useBeatEngine.js'

const BASE = 440

export default function SenseSecond() {
  const navigate = useNavigate()
  const { start, stop, isPlaying } = useBeatEngine()
  const startTimeRef = useRef(null)
  const [taps, setTaps] = useState([])

  const begin = () => {
    setTaps([])
    startTimeRef.current = performance.now()
    start(BASE, BASE + 1, 0.18)
  }

  const finish = () => {
    stop()
  }

  const tap = () => {
    if (!isPlaying || startTimeRef.current === null) return
    const elapsed = performance.now() - startTimeRef.current
    const nearestSecond = Math.round(elapsed / 1000) * 1000
    const deviation = elapsed - nearestSecond
    setTaps((t) => [...t, deviation])
  }

  const avgAbs = taps.length
    ? Math.round(taps.reduce((s, d) => s + Math.abs(d), 0) / taps.length)
    : null
  const last = taps.length ? Math.round(taps[taps.length - 1]) : null

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ Тренажёр</button>
      <h1 className="screen-title">Чувство секунды</h1>
      <p className="screen-subtitle">
        Играется пара 440/441 Гц — ровно одно биение в секунду. Тапайте в такт биениям, как только их услышите.
      </p>

      <div className="stat-grid">
        <div className="stat-box"><div className="v">{taps.length}</div><div className="l">тапов</div></div>
        <div className="stat-box"><div className="v">{avgAbs !== null ? `${avgAbs} мс` : '—'}</div><div className="l">ср. отклонение</div></div>
        <div className="stat-box"><div className="v">{last !== null ? `${last > 0 ? '+' : ''}${last} мс` : '—'}</div><div className="l">последний тап</div></div>
      </div>

      {!isPlaying ? (
        <button className="btn btn-block btn-primary" onClick={begin}>▶ Начать</button>
      ) : (
        <>
          <button
            className="btn btn-block btn-primary"
            style={{ height: 140, fontSize: 20 }}
            onClick={tap}
          >
            ТАП
          </button>
          <button className="btn btn-block" style={{ marginTop: 10 }} onClick={finish}>⏸ Остановить</button>
        </>
      )}

      {taps.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-label" style={{ marginTop: 0 }}>История тапов</div>
          <div className="tag-list">
            {taps.slice(-12).map((d, i) => (
              <span key={i} className={`pill ${Math.abs(d) < 80 ? 'badge-accent' : ''}`}>
                {Math.round(d) > 0 ? '+' : ''}{Math.round(d)} мс
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
