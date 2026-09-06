import { useState } from 'react'
import { useCourseProgress } from '../contexts/CourseProgressContext.jsx'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import LangQuickToggle from './LangQuickToggle.jsx'

function defaultDateTimeLocal() {
  const d = new Date()
  d.setSeconds(0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function OnboardingGate({ children }) {
  const { status, setStatus, startNoviceSchedule } = useCourseProgress()
  const { t } = useLanguage()
  const [step, setStep] = useState('choice') // 'choice' | 'date'
  const [dateValue, setDateValue] = useState(defaultDateTimeLocal)

  if (status !== 'unset') return children

  const wrapStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: '24px',
    background: 'var(--bg, #121212)',
    color: 'var(--text, #f0f0f0)',
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
  }

  if (step === 'choice') {
    return (
      <div style={wrapStyle}>
        <LangQuickToggle />
        <div style={{ fontSize: 40 }}>🎹</div>
        <h1 style={{ fontSize: 20, margin: 0, textAlign: 'center' }}>{t('app_name')}</h1>
        <p style={{ color: 'var(--text-dim, #a0a0a6)', margin: 0, textAlign: 'center', maxWidth: 340 }}>
          {t('og_subtitle')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
          <button
            onClick={() => setStep('date')}
            style={{
              background: 'var(--bg-card, #202023)',
              border: '1px solid var(--border, #2e2e32)',
              borderRadius: 14,
              padding: '16px',
              textAlign: 'left',
              color: 'var(--text, #f0f0f0)',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('og_novice_title')}</div>
            <div style={{ color: 'var(--text-dim, #a0a0a6)', fontSize: 13, lineHeight: 1.5 }}>
              {t('og_novice_desc')}
            </div>
          </button>

          <button
            onClick={() => setStatus('graduate')}
            style={{
              background: 'var(--bg-card, #202023)',
              border: '1px solid var(--border, #2e2e32)',
              borderRadius: 14,
              padding: '16px',
              textAlign: 'left',
              color: 'var(--text, #f0f0f0)',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('og_graduate_title')}</div>
            <div style={{ color: 'var(--text-dim, #a0a0a6)', fontSize: 13, lineHeight: 1.5 }}>
              {t('og_graduate_desc')}
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <LangQuickToggle />
      <div style={{ fontSize: 40 }}>📅</div>
      <h1 style={{ fontSize: 20, margin: 0, textAlign: 'center' }}>{t('og_date_title')}</h1>
      <p style={{ color: 'var(--text-dim, #a0a0a6)', margin: 0, textAlign: 'center', maxWidth: 320 }}>
        {t('og_date_subtitle')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        <input
          type="datetime-local"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          style={{
            background: 'var(--bg-card, #1c1c1e)',
            border: '1px solid var(--border, #2e2e32)',
            borderRadius: 10,
            color: 'var(--text, #f0f0f0)',
            padding: '12px 14px',
            fontSize: 15,
            outline: 'none',
          }}
        />
        <button
          onClick={() => startNoviceSchedule(new Date(dateValue).toISOString())}
          style={{
            background: 'var(--accent, #d9a441)',
            color: 'var(--accent-contrast, #1a1200)',
            border: 'none',
            borderRadius: 10,
            padding: '12px 14px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('og_start_btn')}
        </button>
        <button
          onClick={() => setStep('choice')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim, #a0a0a6)',
            padding: '6px 14px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {t('og_back_btn')}
        </button>
      </div>
    </div>
  )
}
