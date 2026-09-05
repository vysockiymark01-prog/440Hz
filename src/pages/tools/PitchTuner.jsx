import { useNavigate } from 'react-router-dom'
import { usePitchDetector } from '../../hooks/usePitchDetector.js'
import { noteFromFrequency } from '../../utils/noteFromFrequency.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const IN_TUNE_TOLERANCE = 5

export default function PitchTuner() {
  const navigate = useNavigate()
  const { start, stop, isListening, frequency, error } = usePitchDetector()

  const note = frequency ? noteFromFrequency(frequency) : null
  const cents = note?.cents ?? 0
  const clampedCents = Math.max(-50, Math.min(50, cents))
  const inTune = note && Math.abs(cents) <= IN_TUNE_TOLERANCE

  const toggle = () => {
    if (isListening) stop()
    else start()
  }
  const { t } = useLanguage()

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
      <h1 className="screen-title">{t('pd_title')}</h1>
      <p className="screen-subtitle">{t('pd_subtitle')}</p>

      <div className="card" style={{ textAlign: 'center', minHeight: 150 }}>
        {!isListening && (
          <div style={{ color: 'var(--text-faint)', padding: '20px 0' }}>{t('pd_press_listen')}</div>
        )}

        {isListening && !note && (
          <div style={{ color: 'var(--text-faint)', padding: '20px 0' }}>{t('pd_listening')}</div>
        )}

        {isListening && note && (
          <>
            <div className="big-number" style={{ color: inTune ? 'var(--success)' : 'var(--accent)' }}>
              {note.name}<span style={{ fontSize: 22 }}>{note.octave}</span>
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 14 }}>
              {frequency.toFixed(1)} Гц · {cents > 0 ? '+' : ''}{cents} {t('pd_cents')}
            </div>

            <div style={{ position: 'relative', height: 30 }}>
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '50%', height: 3,
                background: 'var(--border)', transform: 'translateY(-50%)', borderRadius: 2,
              }} />
              <div style={{
                position: 'absolute', left: '50%', top: '50%', width: 2, height: 20,
                background: 'var(--text-faint)', transform: 'translate(-50%, -50%)',
              }} />
              <div style={{
                position: 'absolute',
                left: `${50 + clampedCents}%`,
                top: '50%',
                width: 14, height: 14, borderRadius: '50%',
                background: inTune ? 'var(--success)' : 'var(--accent)',
                transform: 'translate(-50%, -50%)',
                transition: 'left .08s linear',
              }} />
            </div>
            <div className="row" style={{ color: 'var(--text-faint)', fontSize: 11, marginTop: 4 }}>
              <span>−50</span>
              <span>0</span>
              <span>+50</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="result-flash bad">
          {t('pd_mic_error')}
        </div>
      )}

      <button className="btn btn-block btn-primary" style={{ marginTop: 10 }} onClick={toggle}>
        {isListening ? t('pd_stop') : t('pd_listen')}
      </button>
    </div>
  )
}
