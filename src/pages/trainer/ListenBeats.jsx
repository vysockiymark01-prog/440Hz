import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatEngine } from '../../hooks/useBeatEngine.js'
import BeatVisualizer from '../../components/BeatVisualizer.jsx'

const BASE = 440

export default function ListenBeats() {
  const navigate = useNavigate()
  const [diff, setDiff] = useState(2)
  const { start, stop, setFreqB, getAnalyser, isPlaying } = useBeatEngine()

  useEffect(() => {
    if (isPlaying) setFreqB(BASE + diff)
  }, [diff, isPlaying, setFreqB])

  useEffect(() => () => stop(), [stop])

  const toggle = () => {
    if (isPlaying) stop()
    else start(BASE, BASE + diff, 0.18)
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ Тренажёр</button>
      <h1 className="screen-title">Послушать биения</h1>
      <p className="screen-subtitle">
        Базовая пара 440 Гц + смещение. Двигайте слайдер и слушайте, как меняется скорость «вау-вау».
      </p>

      <div className="card" style={{ textAlign: 'center' }}>
        <div className="big-number">{diff.toFixed(1)} Гц</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          ≈ {diff.toFixed(1)} биения в секунду
        </div>
      </div>

      <input
        className="freq-slider"
        type="range"
        min="0"
        max="8"
        step="0.1"
        value={diff}
        onChange={(e) => setDiff(parseFloat(e.target.value))}
      />
      <div className="row" style={{ color: 'var(--text-faint)', fontSize: 12, marginTop: -6, marginBottom: 12 }}>
        <span>0 Гц (ноль)</span>
        <span>8 Гц</span>
      </div>

      <div className="row" style={{ gap: 8, marginBottom: 16 }}>
        <button className="btn" style={{ flex: 1 }} onClick={() => setDiff(0)}>0 биений/сек</button>
        <button className="btn" style={{ flex: 1 }} onClick={() => setDiff(1)}>1 биение/сек</button>
      </div>

      <BeatVisualizer getAnalyser={getAnalyser} isPlaying={isPlaying} />

      <button className={`btn btn-block btn-primary`} style={{ marginTop: 16 }} onClick={toggle}>
        {isPlaying ? '⏸ Остановить' : '▶ Играть 440 Гц + смещение'}
      </button>
    </div>
  )
}
