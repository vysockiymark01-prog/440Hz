import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'pt_theme_pref_v1'
const ThemeContext = createContext(null)

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function readStoredPref() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system' || raw === 'auto') return raw
  } catch {
    // ignore
  }
  return 'system'
}

// Тёмная тема с 20:00 до 7:00, светлая в остальное время.
function getTimeOfDayTheme() {
  const hour = new Date().getHours()
  return hour >= 20 || hour < 7 ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [pref, setPrefState] = useState(readStoredPref)
  const [systemTheme, setSystemTheme] = useState(getSystemTheme)
  const [timeTheme, setTimeTheme] = useState(getTimeOfDayTheme)

  useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => setSystemTheme(mql.matches ? 'light' : 'dark')
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTimeTheme(getTimeOfDayTheme()), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const effectiveTheme = pref === 'system' ? systemTheme : pref === 'auto' ? timeTheme : pref

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme)
  }, [effectiveTheme])

  const setPref = useCallback((next) => {
    setPrefState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ pref, setPref, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
