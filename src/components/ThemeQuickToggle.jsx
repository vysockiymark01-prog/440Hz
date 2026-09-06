import { useTheme } from '../contexts/ThemeContext.jsx'
import { useLanguage } from '../contexts/LanguageContext.jsx'

const order = ['system', 'light', 'dark']
const icons = { system: '🌓', light: '☀️', dark: '🌙' }
const labelKeys = { system: 'thq_system', light: 'thq_light', dark: 'thq_dark' }

export default function ThemeQuickToggle() {
  const { pref, setPref } = useTheme()
  const { t } = useLanguage()
  const label = t(labelKeys[pref])

  const cycle = () => {
    const next = order[(order.indexOf(pref) + 1) % order.length]
    setPref(next)
  }

  return (
    <button
      className="theme-quick-toggle"
      onClick={cycle}
      aria-label={t('thq_aria', { label })}
      title={label}
    >
      {icons[pref]}
    </button>
  )
}
