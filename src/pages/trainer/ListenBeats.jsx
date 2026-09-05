import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatEngine } from '../../hooks/useBeatEngine.js'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'
import BeatVisualizer from '../../components/BeatVisualizer.jsx'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const BASE = 440

export default function ListenBeats() {
  const navigate = useNavigate()
  const [diff, setDiff] = useState(2)
  const { start, stop, setFreqB, getAnalyser, isPlaying } = useBeatEngine()
  const { recordActivity } = useTrainerStreak()
  const { t } = useLanguage()

  useEffect(() => {
    if (isPlaying) setFreqB(BASE + diff)
  }, [diff, isPlaying, setFreqB])

  useEffect(() => () => stop(), [stop])

  const toggle = () => {
    if (isPlaying) {
      stop()
    } else {
      start(BASE, BASE + diff, 0.18)
      recordActivity()
    }
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ {t('back_trainer')}</button>
      <h1 className="screen-title">{t('lb_title')}</h1>
      <p className="screen-subtitle">
        {t('lb_subtitle')}
      </p>

      <div className="card" style={{ textAlign: 'center' }}>
        <div className="big-number">{diff.toFixed(1)} Гц</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          {t('lb_beats_per_sec', { n: diff.toFixed(1) })}
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
        <span>{t('lb_hz_zero')}</span>
        <span>{t('lb_hz_eight')}</span>
      </div>

      <div className="row" style={{ gap: 8, marginBottom: 16 }}>
        <button className="btn" style={{ flex: 1 }} onClick={() => setDiff(0)}>{t('lb_zero_beats')}</button>
        <button className="btn" style={{ flex: 1 }} onClick={() => setDiff(1)}>{t('lb_one_beat')}</button>
      </div>

      <BeatVisualizer getAnalyser={getAnalyser} isPlaying={isPlaying} />

      <button className={`btn btn-block btn-primary`} style={{ marginTop: 16 }} onClick={toggle}>
        {isPlaying ? t('lb_stop') : t('lb_play')}
      </button>
    </div>
  )
}
