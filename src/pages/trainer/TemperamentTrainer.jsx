import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import temperamentChain, { beatRate } from '../../data/temperamentChain.js'
import { useTemperamentEngine } from '../../hooks/useTemperamentEngine.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'
import BeatVisualizer from '../../components/BeatVisualizer.jsx'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

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
  const { t, tr } = useLanguage()

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
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ {t('back_trainer')}</button>
      <h1 className="screen-title">{t('tt_title')}</h1>
      <p className="screen-subtitle">
        {t('tt_subtitle_pre')} <Link to="/tools/tuning-fork">{t('tt_subtitle_link')}</Link>
        {t('tt_subtitle_post')}
      </p>

      <div className="stat-grid">
        <div className="stat-box"><div className="v">{stepIndex + 1}/{temperamentChain.length}</div><div className="l">{t('tt_interval_label')}</div></div>
        <div className="stat-box"><div className="v">{progress.attempts ? Math.round((progress.correct / progress.attempts) * 100) : 0}%</div><div className="l">{t('tt_accuracy')}</div></div>
        <div className="stat-box"><div className="v">{avgError}</div><div className="l">{t('tt_avg_error_cents')}</div></div>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 6 }}>
          <span className="pill badge-accent">{tr(step.kindLabel)}</span>
          <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>{t('tt_step_of', { index: step.index, total: step.total })}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 17 }}>
          {step.fromLabel} → {step.toLabel}
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 6, marginBottom: 0 }}>
          {t('tt_anchor_desc', { from: step.fromLabel })}
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
          <span>{t('tt_key_left')}</span>
          <span>{t('tt_key_right')}</span>
        </div>
      </div>

      {!isPlaying ? (
        <button className="btn btn-block btn-primary" onClick={play}>{t('tt_play_interval')}</button>
      ) : (
        <button className="btn btn-block" onClick={stop}>{t('tt_stop')}</button>
      )}

      <button className="btn btn-block btn-primary" style={{ marginTop: 10 }} onClick={check}>
        {t('tt_check')}
      </button>

      {revealed && (
        <>
          <div className={`result-flash ${revealed.success ? 'good' : 'bad'}`}>
            {revealed.success ? t('tt_success') : t('tt_deviation', { error: revealed.error.toFixed(1) })}
            <br />
            <span style={{ fontWeight: 400, fontSize: 13 }}>
              {t('tt_heard_beat', { heard: revealed.heardBeat.toFixed(2), target: step.targetBeatHz.toFixed(2) })}
            </span>
          </div>

          {isChainDone ? (
            <button className="btn btn-block" onClick={restartChain}>{t('tt_restart_chain')}</button>
          ) : (
            <button className="btn btn-block" onClick={nextStep}>{t('tt_next_interval')}</button>
          )}
        </>
      )}

      {!revealed && (
        <button className="btn btn-block" style={{ marginTop: 10 }} onClick={retryStep}>{t('tt_retry_interval')}</button>
      )}
    </div>
  )
}
