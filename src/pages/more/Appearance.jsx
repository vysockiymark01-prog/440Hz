import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext.jsx'

const options = [
  { value: 'system', label: 'Системная', desc: 'Следует за темой устройства и меняется вместе с ней' },
  { value: 'light', label: 'Светлая', desc: 'Всегда светлый интерфейс' },
  { value: 'dark', label: 'Тёмная', desc: 'Всегда тёмный интерфейс' },
]

export default function Appearance() {
  const navigate = useNavigate()
  const { pref, setPref } = useTheme()

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ Ещё</button>
      <h1 className="screen-title">Оформление</h1>
      <p className="screen-subtitle">По умолчанию приложение подстраивается под тему вашего устройства</p>

      <div className="theme-options">
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`theme-option ${pref === opt.value ? 'active' : ''}`}
            onClick={() => setPref(opt.value)}
          >
            <span>
              <div style={{ fontWeight: 700 }}>{opt.label}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{opt.desc}</div>
            </span>
            <span className="check">✓</span>
          </button>
        ))}
      </div>
    </div>
  )
}
