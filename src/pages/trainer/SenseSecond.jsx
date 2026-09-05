import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatEngine } from '../../hooks/useBeatEngine.js'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const BASE = 440

export default function SenseSecond() {
  const navigate = useNavigate()
  const { start, stop, isPlaying } = useBeatEngine()
  const { recordActivity } = useTrainerStreak()
  const startTimeRef = useRef(null)
  const [taps, setTaps] = useState([])
  const { t } = useLanguage()

  const begin = () => {
    setTaps([])
    startTimeRef.current = performance.now()
    start(BASE, BASE + 1, 0.18)
  }

  const finish = () => {
    stop()
    if (taps.length > 0) recordActivity()
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
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ {t('back_trainer')}</button>
      <h1 className="screen-title">{t('ss_title')}</h1>
      <p className="screen-subtitle">
        {t('ss_subtitle')}
      </p>

      <div className="stat-grid">
        <div className="stat-box"><div className="v">{taps.length}</div><div className="l">{t('ss_taps')}</div></div>
        <div className="stat-box"><div className="v">{avgAbs !== null ? `${avgAbs} ${t('ss_ms')}` : '—'}</div><div className="l">{t('ss_avg_deviation')}</div></div>
        <div className="stat-box"><div className="v">{last !== null ? `${last > 0 ? '+' : ''}${last} ${t('ss_ms')}` : '—'}</div><div className="l">{t('ss_last_tap')}</div></div>
      </div>

      {!isPlaying ? (
        <button className="btn btn-block btn-primary" onClick={begin}>{t('ss_begin')}</button>
      ) : (
        <>
          <button
            className="btn btn-block btn-primary"
            style={{ height: 140, fontSize: 20 }}
            onClick={tap}
          >
            {t('ss_tap_button')}
          </button>
          <button className="btn btn-block" style={{ marginTop: 10 }} onClick={finish}>{t('ss_stop')}</button>
        </>
      )}

      {taps.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-label" style={{ marginTop: 0 }}>{t('ss_tap_history')}</div>
          <div className="tag-list">
            {taps.slice(-12).map((d, i) => (
              <span key={i} className={`pill ${Math.abs(d) < 80 ? 'badge-accent' : ''}`}>
                {Math.round(d) > 0 ? '+' : ''}{Math.round(d)} {t('ss_ms')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
