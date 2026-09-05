import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDefectEngine } from '../../hooks/useDefectEngine.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useTrainerStreak } from '../../hooks/useTrainerStreak.js'
import { DEFECT_TYPES } from '../../audio/DefectEngine.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const LABEL_KEYS = {
  clean: 'ed_label_clean',
  buzz: 'ed_label_buzz',
  harsh: 'ed_label_harsh',
  inharmonic: 'ed_label_inharmonic',
}

function randomType() {
  return DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)]
}

function randomFreq() {
  return Math.round(180 + Math.random() * 150)
}

export default function EarDiagnostics() {
  const navigate = useNavigate()
  const { play, stop } = useDefectEngine()
  const [current, setCurrent] = useState(() => ({ type: randomType(), freq: randomFreq() }))
  const [selected, setSelected] = useState(null)
  const [stats, setStats] = useLocalStorage('pt_ear_diag_stats_v1', { attempts: 0, correct: 0 })
  const { recordActivity } = useTrainerStreak()
  const { t } = useLanguage()

  useEffect(() => () => stop(), [stop])

  const playCurrent = useCallback(() => {
    play(current.type, current.freq)
  }, [play, current])

  const choose = (type) => {
    if (selected !== null) return
    setSelected(type)
    const good = type === current.type
    setStats((s) => ({ attempts: s.attempts + 1, correct: s.correct + (good ? 1 : 0) }))
    recordActivity()
  }

  const next = () => {
    stop()
    setSelected(null)
    setCurrent({ type: randomType(), freq: randomFreq() })
  }

  const accuracy = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/trainer')}>‹ {t('back_trainer')}</button>
      <h1 className="screen-title">{t('ed_title')}</h1>
      <p className="screen-subtitle">
        {t('ed_subtitle')}
      </p>

      <div className="stat-grid">
        <div className="stat-box"><div className="v">{stats.attempts}</div><div className="l">{t('ed_attempts')}</div></div>
        <div className="stat-box"><div className="v">{accuracy}%</div><div className="l">{t('ed_accuracy')}</div></div>
      </div>

      <button className="btn btn-block" onClick={playCurrent}>{t('ed_play_sound')}</button>

      <div style={{ marginTop: 16 }}>
        {DEFECT_TYPES.map((type) => {
          let cls = 'theme-option'
          if (selected !== null) {
            if (type === current.type) cls += ' quiz-correct'
            else if (type === selected) cls += ' quiz-wrong'
          }
          return (
            <button key={type} className={cls} style={{ marginBottom: 8 }} onClick={() => choose(type)}>
              <span>{t(LABEL_KEYS[type])}</span>
              {selected !== null && type === current.type && <span className="check" style={{ visibility: 'visible' }}>✓</span>}
              {selected !== null && type === selected && type !== current.type && <span className="check" style={{ visibility: 'visible', color: 'var(--danger)' }}>✕</span>}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <button className="btn btn-block btn-primary" onClick={next}>{t('ed_next_sound')}</button>
      )}
    </div>
  )
}
