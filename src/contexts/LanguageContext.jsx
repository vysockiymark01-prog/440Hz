import { createContext, useContext, useState, useCallback } from 'react'
import translations from '../data/i18n.js'

const STORAGE_KEY = 'pt_lang_v1'
const LanguageContext = createContext(null)

function readStoredLang() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'ru' || raw === 'mn') return raw
  } catch {
    // ignore
  }
  return 'ru'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang)

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  // t('key') — если перевода нет (или он ещё не сделан для этого раздела),
  // молча показываем русский текст, чтобы ничего не «ломалось» на непереведённых экранах.
  // t('key', {name: value}) — подставляет {name} в строке-шаблоне значением value.
  const t = useCallback(
    (key, params) => {
      let str = translations[lang]?.[key] ?? translations.ru[key] ?? key
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replaceAll(`{${k}}`, v)
        })
      }
      return str
    },
    [lang]
  )

  // tr({ru: '...', mn: '...'}) — для локализованных полей внутри объектов данных
  // (чек-листы, фразы, лекции и т.п.), в отличие от t(), которая берёт текст по ключу
  // из общего словаря интерфейса.
  const tr = useCallback(
    (field) => field?.[lang] ?? field?.ru ?? '',
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tr }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
