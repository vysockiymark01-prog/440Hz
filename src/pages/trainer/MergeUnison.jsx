import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatEngine } from '../../hooks/useBeatEngine.js'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import BeatVisualizer from '../../components/BeatVisualizer.jsx'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const BASE = 440

// Адаптивная сложность: допуск точности сужается по мере серии верных попыток.
function toleranceFor(streak) {
  if (streak >= 6) return 0.08
  if (streak >= 3) return 0.11
  return 0.15
}

function randomTarget() {
  const magnitude = 0.5 + Math.random() * 3.5
  const sign = Math.random() < 0.5 ? -1 : 1
  return Math.round(magnitude * sign * 20) / 20
}

export default function MergeUnison() {
  const navigate = useNavigate()
  const { start, stop, setFreqB, getAnalyser, isPlaying } = useBeatEngine()
  const { recordActivity } = useTrainerStreak()
  const [progress, setProgress] = useLocalStorage('pt_unison_progress_v1', { streak: 0 })
  const successTolerance = toleranceFor(progress.streak || 0)
  const [hiddenTarget, setHiddenTarget] = useState(randomTarget)
  const [knob, setKnob] = useState(0)
  const [revealed, setRevealed] = useState(null)
  // mode: 'idle' | 'exercise' | 'demo-zero' | 'demo-one' — различает, что сейчас
  // звучит, чтобы слайдер «ключа» не переопределял частоту во время примеров.
  const [mode, setMode] = useState('idle')
  const knobRef = useRef(knob)
  knobRef.current = knob
  const { t } = useLanguage()

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
    const success = error <= successTolerance
    setRevealed({ success, error, target: hiddenTarget })
    setProgress((p) => ({ streak: success ? (p.streak || 0) + 1 : 0 }))
    recordActivity()
  }, [currentOffset, hiddenTarget, recordActivity, successTolerance, setProgress])

  const newRound = () => {
    stop()
    setMode('idle')
    setHiddenTarget(randomTarget())
    setKnob(0)
    setRevealed(null)
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ {t('back_trainer')}</button>
      <h1 className="screen-title">{t('mu_title')}</h1>
      <p className="screen-subtitle">
        {t('mu_subtitle')}
      </p>
      <div style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 10 }}>
        {t('mu_precision_now', { tolerance: successTolerance.toFixed(2), streak: progress.streak || 0 })}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>{t('mu_reference_title')}</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 10 }}>
          {t('mu_reference_desc')}
        </p>
        <div className="row" style={{ gap: 8 }}>
          {mode === 'demo-zero' && isPlaying ? (
            <button className="btn" style={{ flex: 1 }} onClick={stopAll}>{t('mu_stop')}</button>
          ) : (
            <button className="btn" style={{ flex: 1 }} onClick={playDemoZero}>{t('mu_demo_zero')}</button>
          )}
          {mode === 'demo-one' && isPlaying ? (
            <button className="btn" style={{ flex: 1 }} onClick={stopAll}>{t('mu_stop')}</button>
          ) : (
            <button className="btn" style={{ flex: 1 }} onClick={playDemoOne}>{t('mu_demo_one')}</button>
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
          <span>{t('mu_key_left')}</span>
          <span>{t('mu_key_right')}</span>
        </div>
      </div>

      {mode === 'exercise' && isPlaying ? (
        <button className="btn btn-block" onClick={stopAll}>{t('mu_stop')}</button>
      ) : (
        <button className="btn btn-block btn-primary" onClick={play}>{t('mu_play_unison')}</button>
      )}

      <button className="btn btn-block btn-primary" style={{ marginTop: 10 }} onClick={check}>
        {t('mu_check_unison')}
      </button>

      {revealed && (
        <>
          <div className={`result-flash ${revealed.success ? 'good' : 'bad'}`}>
            {revealed.success
              ? t('mu_success')
              : t('mu_remaining_offset', { error: revealed.error.toFixed(2) })}
          </div>
          <button className="btn btn-block" onClick={newRound}>{t('mu_new_attempt')}</button>
        </>
      )}
    </div>
  )
}
