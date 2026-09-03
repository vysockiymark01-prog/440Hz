import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useFontScale, FONT_SCALES } from '../../contexts/FontScaleContext.jsx'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const THEME_OPTION_KEYS = [
  { value: 'system', labelKey: 'appearance_theme_system', descKey: 'appearance_theme_system_desc' },
  { value: 'auto', labelKey: 'appearance_theme_auto', descKey: 'appearance_theme_auto_desc' },
  { value: 'light', labelKey: 'appearance_theme_light', descKey: 'appearance_theme_light_desc' },
  { value: 'dark', labelKey: 'appearance_theme_dark', descKey: 'appearance_theme_dark_desc' },
]

const LANG_OPTIONS = [
  { value: 'ru', labelKey: 'appearance_language_ru' },
  { value: 'mn', labelKey: 'appearance_language_mn' },
]

export default function Appearance() {
  const navigate = useNavigate()
  const { pref, setPref } = useTheme()
  const { scale, setScale } = useFontScale()
  const { lang, setLang, t } = useLanguage()
  const options = THEME_OPTION_KEYS.map((opt) => ({ ...opt, label: t(opt.labelKey), desc: t(opt.descKey) }))

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/more')}>‹ {t('more_title')}</button>
      <h1 className="screen-title">{t('appearance_title')}</h1>
      <p className="screen-subtitle">{t('appearance_subtitle')}</p>

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

      <div className="section-label">{t('appearance_font_size')}</div>
      <div className="theme-options">
        {FONT_SCALES.map((opt) => (
          <button
            key={opt.value}
            className={`theme-option ${scale === opt.value ? 'active' : ''}`}
            onClick={() => setScale(opt.value)}
          >
            <span style={{ fontWeight: 700 }}>{opt.label}</span>
            <span className="check">✓</span>
          </button>
        ))}
      </div>

      <div className="section-label">{t('appearance_language')}</div>
      <div className="theme-options">
        {LANG_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`theme-option ${lang === opt.value ? 'active' : ''}`}
            onClick={() => setLang(opt.value)}
          >
            <span style={{ fontWeight: 700 }}>{t(opt.labelKey)}</span>
            <span className="check">✓</span>
          </button>
        ))}
      </div>
    </div>
  )
}
