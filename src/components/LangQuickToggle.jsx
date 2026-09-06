import { useLanguage } from '../contexts/LanguageContext.jsx'

const labels = { ru: 'Русский', mn: 'Монгол' }

export default function LangQuickToggle() {
  const { lang, setLang, t } = useLanguage()

  const toggle = () => {
    setLang(lang === 'ru' ? 'mn' : 'ru')
  }

  return (
    <button
      className="lang-quick-toggle"
      onClick={toggle}
      aria-label={`${t('lang_switch_aria')}: ${labels[lang]}`}
      title={labels[lang]}
    >
      {lang === 'ru' ? 'RU' : 'MN'}
    </button>
  )
}
