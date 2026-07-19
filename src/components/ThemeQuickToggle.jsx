import { useTheme } from '../contexts/ThemeContext.jsx'

const order = ['system', 'light', 'dark']
const icons = { system: '🌓', light: '☀️', dark: '🌙' }
const labels = { system: 'Системная тема', light: 'Светлая тема', dark: 'Тёмная тема' }

export default function ThemeQuickToggle() {
  const { pref, setPref } = useTheme()

  const cycle = () => {
    const next = order[(order.indexOf(pref) + 1) % order.length]
    setPref(next)
  }

  return (
    <button
      className="theme-quick-toggle"
      onClick={cycle}
      aria-label={`Тема: ${labels[pref]}. Нажмите, чтобы переключить`}
      title={labels[pref]}
    >
      {icons[pref]}
    </button>
  )
}
